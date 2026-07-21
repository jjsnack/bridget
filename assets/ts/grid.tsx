/**
 * Grid archetype (`type: grid`, `layouts/grid/single.html`).
 * A tag-filtered image grid; clicking a frame opens a viewer with a looping
 * vertical thumbnail rail beside a full-size stage. Scrolling advances the
 * image (wheel on desktop, arrows on touch); a live counter in the nav shows
 * current / total.
 *
 * Grid + filter bar are server-rendered; this module is a progressive
 * enhancement (mirrors post.tsx): it wires those existing DOM nodes and
 * portals the viewer overlay. No desktop/mobile split — one CSS layout swaps
 * the rail from a left column to a bottom strip at the tablet breakpoint.
 */

import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  untrack,
  type JSX
} from 'solid-js'
import { render } from 'solid-js/web'

import { isMobile } from './utils'

interface Item {
  index: number // global index (data-index), stable across filters
  tags: string[]
  hiUrl: string
  hiW: number
  hiH: number
  thumbUrl: string // ponytail: reuse the grid's lo-res src (already cached), no separate rail resize
  caption: string
}

// how many times the rail repeats the set — enough copies above/below the
// active thumb that a burst of advances never runs off either end before the
// silent rebase re-centres it
const RAIL_REPEAT = 5
const RAIL_MID = Math.floor(RAIL_REPEAT / 2) // copy the loop rebases back into
const WHEEL_COOLDOWN = 340 // ms between wheel-driven advances
const WHEEL_THRESHOLD = 8 // ignore tiny trackpad jitter

const COL_MIN = 1
const COL_MAX = 5
const COL_DEFAULT = 3
const COL_KEY = 'gridColumns'

function parseItems(buttons: HTMLButtonElement[]): Item[] {
  return buttons.map((btn) => ({
    index: Number(btn.dataset.index ?? 0),
    tags: (btn.dataset.tags ?? '').split(' ').filter(Boolean),
    hiUrl: btn.dataset.hiUrl ?? '',
    hiW: Number(btn.dataset.hiW ?? 0),
    hiH: Number(btn.dataset.hiH ?? 0),
    thumbUrl: btn.querySelector('img')?.getAttribute('src') ?? '',
    caption: btn.dataset.caption ?? ''
  }))
}

// Column stepper (nav, shown while browsing): sets --grid-cols on the masonry
// container. Persists per session, like the gallery's threshold. Plain DOM.
function setupColumns(main: HTMLElement): void {
  const control = document.querySelector<HTMLElement>('.gridColumns')
  const items = main.querySelector<HTMLElement>('.gridItems')
  if (control == null || items == null) return
  const dec = control.querySelector<HTMLButtonElement>('.dec')
  const inc = control.querySelector<HTMLButtonElement>('.inc')
  const nums = Array.from(control.querySelectorAll<HTMLElement>('.num'))

  const stored = Number(sessionStorage.getItem(COL_KEY))
  let cols =
    Number.isInteger(stored) && stored >= COL_MIN && stored <= COL_MAX
      ? stored
      : COL_DEFAULT

  const apply = (): void => {
    items.style.setProperty('--grid-cols', String(cols))
    items.dataset.cols = String(cols) // lets CSS special-case the 1- and 5-column layouts
    const digits = String(cols).padStart(nums.length, '0')
    nums.forEach((el, i) => (el.innerText = digits[i] ?? '0'))
    sessionStorage.setItem(COL_KEY, String(cols))
  }

  dec?.addEventListener('click', () => {
    if (cols > COL_MIN) {
      cols -= 1
      apply()
    }
  })
  inc?.addEventListener('click', () => {
    if (cols < COL_MAX) {
      cols += 1
      apply()
    }
  })
  apply()
}

// write "current / total" into the nav counter's six digit spans
function setCounter(current: number, total: number): void {
  const el = document.querySelector<HTMLElement>('.gridCount')
  if (el == null) return
  const digits = String(current).padStart(3, '0') + String(total).padStart(3, '0')
  el.querySelectorAll<HTMLElement>('.num').forEach((span, i) => {
    span.innerText = digits[i] ?? '0'
  })
}

function Grid(props: {
  gridButtons: HTMLButtonElement[]
  tagButtons: HTMLButtonElement[]
  root: HTMLElement
  closeText: string
  nextText: string
  prevText: string
}): JSX.Element {
  // gridButtons never changes; the memo just parks the prop read in a tracked
  // scope (parses once) so it isn't a reactivity foot-gun
  const items = createMemo(() => parseItems(props.gridButtons))
  const mobile = isMobile()

  const [activeTag, setActiveTag] = createSignal('*')
  const [open, setOpen] = createSignal(false)
  const [pos, setPos] = createSignal(0) // image index within filtered()
  // flat index into the repeated rail (railRows) that is currently centred;
  // railIndex % n === pos. Advancing only ever nudges this by ±1 so the strip
  // glides one thumb at a time; a silent rebase keeps it near the middle copy.
  const [railIndex, setRailIndex] = createSignal(0)
  let trigger: HTMLButtonElement | null = null
  let closeBtn: HTMLButtonElement | undefined
  let rail: HTMLOListElement | undefined
  let wheelLock = false

  const filtered = createMemo(() =>
    activeTag() === '*'
      ? items()
      : items().filter((it) => it.tags.includes(activeTag()))
  )
  const current = createMemo(() => filtered()[pos()] ?? null)

  // the rail is the filtered set repeated RAIL_REPEAT times; the flat index
  // (railIndex) walks this list and rebases into the middle copy to loop
  const railRows = createMemo(() => {
    const f = filtered()
    const rows: Item[] = []
    for (let c = 0; c < RAIL_REPEAT; c++) rows.push(...f)
    return rows
  })

  // reflect the active tag onto the server-rendered grid + filter buttons
  createEffect(() => {
    const tag = activeTag()
    props.gridButtons.forEach((btn) => {
      const tags = (btn.dataset.tags ?? '').split(' ').filter(Boolean)
      btn.classList.toggle('hidden', tag !== '*' && !tags.includes(tag))
    })
    props.tagButtons.forEach((btn) => {
      const on = (btn.dataset.tag ?? '*') === tag
      btn.classList.toggle('active', on)
      btn.setAttribute('aria-pressed', String(on))
    })
  })

  // keep the nav counter in sync (also reflects filter changes while closed)
  createEffect(() => {
    setCounter(pos() + 1, filtered().length)
  })

  // centre rail child at flat index `i`; smooth for an advance, instant for the
  // silent rebase (same image, so no visible motion)
  const scrollToRail = (i: number, smooth: boolean): void => {
    const li = rail?.children[i] as HTMLElement | undefined
    li?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'center',
      inline: 'center'
    })
  }

  // after a glide settles, if the centred index has drifted out of the middle
  // band, jump it back to the equivalent thumb in the middle copy — invisible,
  // since the content there is identical
  const rebaseRail = (): void => {
    if (!open()) return
    const n = filtered().length
    if (n === 0) return
    const i = railIndex()
    if (i >= n && i < (RAIL_REPEAT - 1) * n) return
    const rebased = RAIL_MID * n + (((i % n) + n) % n)
    setRailIndex(rebased)
    scrollToRail(rebased, false)
  }

  const step = (dir: number): void => {
    const n = filtered().length
    if (n === 0) return
    setPos((p) => (p + dir + n) % n)
    const i = railIndex() + dir
    setRailIndex(i)
    scrollToRail(i, true)
  }
  const next = (): void => step(1)
  const prev = (): void => step(-1)

  const goTo = (flat: number): void => {
    setPos(((flat % filtered().length) + filtered().length) % filtered().length)
    setRailIndex(flat)
    scrollToRail(flat, true)
  }

  const openAt = (btn: HTMLButtonElement): void => {
    const n = filtered().length
    const p = filtered().findIndex((it) => it.index === Number(btn.dataset.index ?? 0))
    if (p < 0) return
    trigger = btn
    setPos(p)
    setRailIndex(RAIL_MID * n + p)
    setOpen(true)
  }
  const close = (): void => {
    setOpen(false)
    trigger?.focus()
  }

  const onKey = (e: KeyboardEvent): void => {
    if (!open()) return
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
  }

  // scroll advances the image (one step per wheel gesture, throttled)
  const onWheel = (e: WheelEvent): void => {
    if (!open()) return
    e.preventDefault()
    if (wheelLock || Math.abs(e.deltaY) < WHEEL_THRESHOLD) return
    wheelLock = true
    if (e.deltaY > 0) next()
    else prev()
    window.setTimeout(() => {
      wheelLock = false
    }, WHEEL_COOLDOWN)
  }

  // lock page scroll + swap the nav's stepper for the counter while viewing
  createEffect(() => {
    document.body.style.overflow = open() ? 'hidden' : ''
    document.body.classList.toggle('gridViewing', open())
  })
  onCleanup(() => {
    document.body.style.overflow = ''
    document.body.classList.remove('gridViewing')
  })

  // trap focus/AT inside the viewer: `inert` pulls every other top-level
  // element out of the tab order + a11y tree while open (mirrors post.tsx)
  createEffect(() => {
    const isOpen = open()
    Array.from(document.body.children).forEach((el) => {
      if (el !== props.root) el.toggleAttribute('inert', isOpen)
    })
    if (isOpen) closeBtn?.focus()
  })
  onCleanup(() => {
    Array.from(document.body.children).forEach((el) => {
      el.toggleAttribute('inert', false)
    })
  })

  // on open: centre the starting thumb instantly, and rebase the loop whenever
  // a glide finishes (scrollend) so it can run forever without a visible reset
  createEffect(() => {
    if (!open() || rail == null) return
    const el = rail
    requestAnimationFrame(() => {
      scrollToRail(untrack(railIndex), false)
    })
    el.addEventListener('scrollend', rebaseRail)
    onCleanup(() => el.removeEventListener('scrollend', rebaseRail))
  })

  onMount(() => {
    const c = new AbortController()
    const { signal } = c
    props.gridButtons.forEach((btn) =>
      btn.addEventListener('click', () => openAt(btn), { signal })
    )
    props.tagButtons.forEach((btn) =>
      btn.addEventListener('click', () => setActiveTag(btn.dataset.tag ?? '*'), {
        signal
      })
    )
    window.addEventListener('keydown', onKey, { signal })
    window.addEventListener('wheel', onWheel, { signal, passive: false })
    onCleanup(() => c.abort())
  })

  return (
    <Show when={open()}>
      <div class="gridViewer" role="dialog" aria-modal="true" aria-label="Image viewer">
        <button ref={closeBtn} class="gridClose" type="button" onClick={close}>
          {props.closeText}
        </button>

        <ol ref={rail} class="gridRail" aria-label="Thumbnails">
          <For each={railRows()}>
            {(row, i) => {
              const active = (): boolean => i() === railIndex()
              return (
                <li>
                  <button
                    class="gridRailItem"
                    classList={{ active: active() }}
                    type="button"
                    aria-current={active() ? 'true' : undefined}
                    onClick={() => goTo(i())}
                  >
                    <img
                      src={row.thumbUrl}
                      alt={row.caption}
                      loading="lazy"
                      draggable="false"
                    />
                  </button>
                </li>
              )
            }}
          </For>
        </ol>

        <div class="gridStage">
          <Show when={current()} keyed>
            {(it) => (
              <figure class="gridStageFrame">
                <img
                  src={it.hiUrl}
                  width={it.hiW}
                  height={it.hiH}
                  alt={it.caption}
                  draggable="false"
                />
                <Show when={it.caption !== ''}>
                  <figcaption>{it.caption}</figcaption>
                </Show>
              </figure>
            )}
          </Show>

          <Show when={mobile}>
            <button
              class="gridNav prev"
              type="button"
              aria-label={props.prevText}
              onClick={prev}
            >
              &#x2039;
            </button>
            <button
              class="gridNav next"
              type="button"
              aria-label={props.nextText}
              onClick={next}
            >
              &#x203A;
            </button>
          </Show>
        </div>
      </div>
    </Show>
  )
}

export function initGrid(): void {
  const main = document.querySelector<HTMLElement>('.grid')
  if (main == null) return
  const gridButtons = Array.from(main.querySelectorAll<HTMLButtonElement>('.gridItem'))
  if (gridButtons.length === 0) return
  const tagButtons = Array.from(main.querySelectorAll<HTMLButtonElement>('.gridTag'))

  setupColumns(main)

  const ds = document.querySelector<HTMLElement>('.container')?.dataset
  const root = document.createElement('div')
  root.className = 'gridOverlayRoot'
  document.body.appendChild(root)

  render(
    () => (
      <Grid
        gridButtons={gridButtons}
        tagButtons={tagButtons}
        root={root}
        closeText={ds?.close ?? 'close'}
        nextText={ds?.next ?? 'next'}
        prevText={ds?.prev ?? 'prev'}
      />
    ),
    root
  )
}
