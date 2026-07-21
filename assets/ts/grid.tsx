/**
 * Grid archetype (`type: grid`, `layouts/grid/single.html`).
 * A tag-filtered image grid; clicking a frame opens a viewer with a vertical
 * thumbnail rail of the current (filtered) set beside a full-size stage —
 * prev/next cycle within the filtered set, matching gregorcollienne.com/focus.
 * A column stepper (mirroring the gallery's threshold control) adjusts the
 * masonry column count on desktop.
 *
 * Grid + filter bar + stepper are server-rendered; this module is a
 * progressive enhancement (mirrors post.tsx): it wires those existing DOM
 * nodes and portals the viewer overlay. No desktop/mobile split — one CSS
 * layout swaps the rail from a left column to a bottom strip at the tablet
 * breakpoint.
 */

import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  type JSX
} from 'solid-js'
import { render } from 'solid-js/web'

import CustomCursor from './desktop/customCursor'
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

// Column stepper: sets --grid-cols on the masonry container (CSS only honours
// it at tablet+, where the grid is multi-column). Choice persists per session,
// like the gallery's threshold. Plain DOM — no reactivity needed.
function setupColumns(main: HTMLElement): void {
  // the stepper lives in the nav (outside .grid), the masonry inside it
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
    items.dataset.cols = String(cols) // lets CSS special-case the 1-column scatter
    const digits = String(cols).padStart(nums.length, '0') // e.g. 003, matching the threshold
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
  const [pos, setPos] = createSignal(0) // position within filtered()
  const [overImage, setOverImage] = createSignal(false)
  let trigger: HTMLButtonElement | null = null
  let closeBtn: HTMLButtonElement | undefined
  let rail: HTMLOListElement | undefined

  const filtered = createMemo(() =>
    activeTag() === '*'
      ? items()
      : items().filter((it) => it.tags.includes(activeTag()))
  )
  const current = createMemo(() => filtered()[pos()] ?? null)

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

  const openAt = (btn: HTMLButtonElement): void => {
    const p = filtered().findIndex((it) => it.index === Number(btn.dataset.index ?? 0))
    if (p < 0) return
    trigger = btn
    setPos(p)
    setOpen(true)
  }
  const close = (): void => {
    setOpen(false)
    trigger?.focus()
  }
  const next = (): void => {
    setPos((p) => (p + 1) % filtered().length)
  }
  const prev = (): void => {
    setPos((p) => (p + filtered().length - 1) % filtered().length)
  }

  const onKey = (e: KeyboardEvent): void => {
    if (!open()) return
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowRight') next()
    else if (e.key === 'ArrowLeft') prev()
  }

  // lock page scroll while the viewer covers the viewport
  createEffect(() => {
    document.body.style.overflow = open() ? 'hidden' : ''
  })
  onCleanup(() => {
    document.body.style.overflow = ''
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

  // keep the active rail thumbnail in view as prev/next walk the set
  createEffect(() => {
    if (!open()) return
    const active = rail?.querySelector('.gridRailItem.active')
    active?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
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
    onCleanup(() => c.abort())
  })

  return (
    <>
      <Show when={open()}>
        <div
          class="gridViewer"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button ref={closeBtn} class="gridClose" type="button" onClick={close}>
            {props.closeText}
          </button>

          <ol ref={rail} class="gridRail" aria-label="Thumbnails">
            <For each={filtered()}>
              {(it, i) => (
                <li>
                  <button
                    class="gridRailItem"
                    classList={{ active: i() === pos() }}
                    type="button"
                    aria-current={i() === pos() ? 'true' : undefined}
                    onClick={() => setPos(i())}
                  >
                    <img
                      src={it.thumbUrl}
                      alt={it.caption}
                      loading="lazy"
                      draggable="false"
                    />
                  </button>
                </li>
              )}
            </For>
          </ol>

          <div
            class="gridStage"
            onClick={mobile ? undefined : next}
            onMouseEnter={() => setOverImage(true)}
            onMouseLeave={() => setOverImage(false)}
          >
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
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
              >
                &#x2039;
              </button>
              <button
                class="gridNav next"
                type="button"
                aria-label={props.nextText}
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
              >
                &#x203A;
              </button>
            </Show>
          </div>
        </div>
      </Show>

      {/* desktop: custom cursor reads "next", but only over the stage image —
          elsewhere (rail, close) the system pointer stays for the controls */}
      <Show when={!mobile}>
        <CustomCursor
          active={() => open() && overImage()}
          cursorText={() => props.nextText}
        />
      </Show>
    </>
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
