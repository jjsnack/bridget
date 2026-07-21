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
  const vertical = !mobile // rail runs down on desktop, across on mobile
  let noRebaseUntil = 0 // suppress the seamless rebase during a programmatic glide
  let scrollRAF = 0

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

  // rail geometry, abstracted over the scroll axis (vertical desktop / across mobile)
  const kidStart = (k: HTMLElement): number => (vertical ? k.offsetTop : k.offsetLeft)
  const kidSize = (k: HTMLElement): number =>
    vertical ? k.offsetHeight : k.offsetWidth
  const railPos = (el: HTMLElement): number => (vertical ? el.scrollTop : el.scrollLeft)
  const setRailPos = (el: HTMLElement, v: number): void => {
    if (vertical) el.scrollTop = v
    else el.scrollLeft = v
  }
  const railViewport = (el: HTMLElement): number =>
    vertical ? el.clientHeight : el.clientWidth

  // centre rail child `i`; smooth for a click/arrow glide, instant for setup
  const scrollToRail = (i: number, smooth: boolean): void => {
    const li = rail?.children[i] as HTMLElement | undefined
    if (li == null) return
    if (smooth) noRebaseUntil = performance.now() + 700
    li.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'center',
      inline: 'center'
    })
  }

  // the rail free-scrolls (wheel/touch); this reads the scroll position, keeps
  // it inside the middle band (seamless loop) and drives the stage from
  // whichever thumb is nearest centre
  const onRailScroll = (): void => {
    if (scrollRAF !== 0) return
    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = 0
      const el = rail
      const n = filtered().length
      if (el == null || n === 0) return
      const kids = el.children
      if (kids.length <= n) return

      const oneSet = kidStart(kids[n] as HTMLElement) - kidStart(kids[0] as HTMLElement)
      // seamless rebase: wrap the scroll offset by one set when it nears an end
      if (oneSet > 0 && performance.now() >= noRebaseUntil) {
        const p = railPos(el)
        if (p < oneSet) setRailPos(el, p + oneSet)
        else if (p >= oneSet * (RAIL_REPEAT - 1)) setRailPos(el, p - oneSet)
      }

      const mid = railPos(el) + railViewport(el) / 2
      let best = 0
      let bestDist = Infinity
      for (let i = 0; i < kids.length; i++) {
        const k = kids[i] as HTMLElement
        const dist = Math.abs(kidStart(k) + kidSize(k) / 2 - mid)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      }
      setRailIndex(best)
      setPos(best % n)
    })
  }

  const next = (): void => scrollToRail(railIndex() + 1, true)
  const prev = (): void => scrollToRail(railIndex() - 1, true)
  const goTo = (flat: number): void => scrollToRail(flat, true)

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

  // wheel scrolls the rail continuously (no snapping) — page-like momentum,
  // since macOS momentum keeps emitting wheel deltas we forward here
  const onWheel = (e: WheelEvent): void => {
    if (!open() || rail == null) return
    e.preventDefault()
    setRailPos(rail, railPos(rail) + (vertical ? e.deltaY : e.deltaY || e.deltaX))
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

  // on open: centre the starting thumb instantly, then follow the rail's own
  // scrolling (wheel/touch) to move the stage and keep the loop seamless
  createEffect(() => {
    if (!open() || rail == null) return
    const el = rail
    requestAnimationFrame(() => {
      scrollToRail(untrack(railIndex), false)
    })
    el.addEventListener('scroll', onRailScroll, { passive: true })
    onCleanup(() => {
      el.removeEventListener('scroll', onRailScroll)
      if (scrollRAF !== 0) {
        cancelAnimationFrame(scrollRAF)
        scrollRAF = 0
      }
    })
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
          {/* not keyed: the <img> persists and its src swaps as the rail
              scrolls, so the stage tracks the motion without a remount flash */}
          <Show when={current()}>
            <figure class="gridStageFrame">
              <img
                src={current()?.hiUrl}
                width={current()?.hiW}
                height={current()?.hiH}
                alt={current()?.caption}
                draggable="false"
              />
              <Show when={(current()?.caption ?? '') !== ''}>
                <figcaption>{current()?.caption}</figcaption>
              </Show>
            </figure>
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
