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
  Index,
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

import CustomCursor from './desktop/customCursor'
import { mountMobileStage, type MobileStage } from './mobileStage'
import { type ImageJSON } from './resources'
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
const RAIL_GROW = 0.3 // extra scale on the centred thumb (→ ~1.3×)
const RAIL_LIFT = 30 // px the centred thumb rises out of the strip toward the stage
const RAIL_FADE = 0.55 // resting opacity of an off-centre thumb

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
  const digits = String(current).padStart(4, '0') + String(total).padStart(4, '0')
  el.querySelectorAll<HTMLElement>('.num').forEach((span, i) => {
    span.innerText = digits[i] ?? '0'
  })
}

function Grid(props: {
  gridButtons: HTMLButtonElement[]
  tagButtons: HTMLButtonElement[]
  toggle: HTMLButtonElement | null
  tagList: HTMLElement | null
  root: HTMLElement
  closeText: string
  loadingText: string
  nextText: string
  prevText: string
}): JSX.Element {
  // gridButtons never changes; the memo just parks the prop read in a tracked
  // scope (parses once) so it isn't a reactivity foot-gun
  const items = createMemo(() => parseItems(props.gridButtons))
  const mobile = isMobile()

  // mobile reuses the scatter gallery's swipeable focus view instead of the
  // rail viewer. Built once over every image (data-index === position), so a
  // tap opens the same stage as the main gallery.
  // ponytail: the tag filter narrows the grid you browse, not the swipe set —
  // opening any thumb drops into the full image set, matching the plain gallery
  let stage: MobileStage | null = null
  if (mobile) {
    onMount(() => {
      const images: ImageJSON[] = items().map((it) => ({
        index: it.index,
        alt: it.caption,
        loUrl: it.thumbUrl,
        loImgW: it.hiW,
        loImgH: it.hiH,
        hiUrl: it.hiUrl,
        hiImgW: it.hiW,
        hiImgH: it.hiH
      }))
      stage = mountMobileStage(images, props.closeText, props.loadingText)
    })
    onCleanup(() => stage?.dispose())
  }

  // multi-select filter: an image shows if it carries *any* selected tag;
  // an empty selection means "all". `expanded` toggles the tag-list disclosure.
  const [selected, setSelected] = createSignal<string[]>([])
  const [expanded, setExpanded] = createSignal(false)
  const [open, setOpen] = createSignal(false)
  const [pos, setPos] = createSignal(0) // image index within filtered()
  // flat index into the repeated rail (railRows) that is currently centred;
  // railIndex % n === pos. Advancing only ever nudges this by ±1 so the strip
  // glides one thumb at a time; a silent rebase keeps it near the middle copy.
  const [railIndex, setRailIndex] = createSignal(0)
  let trigger: HTMLButtonElement | null = null
  let viewer: HTMLDivElement | undefined
  let rail: HTMLOListElement | undefined
  // custom "close" cursor is shown only over the stage (clicking it closes);
  // the rail stays a normal pointer since its thumbs navigate
  const [overStage, setOverStage] = createSignal(false)
  const vertical = !mobile // rail runs down on desktop, across on mobile
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let noRebaseUntil = 0 // suppress the seamless rebase during a programmatic glide
  let scrollRAF = 0

  const filtered = createMemo(() => {
    const sel = selected()
    return sel.length === 0
      ? items()
      : items().filter((it) => it.tags.some((t) => sel.includes(t)))
  })
  const current = createMemo(() => filtered()[pos()] ?? null)

  // the rail is the filtered set repeated RAIL_REPEAT times; the flat index
  // (railIndex) walks this list and rebases into the middle copy to loop
  const railRows = createMemo(() => {
    const f = filtered()
    const rows: Item[] = []
    for (let c = 0; c < RAIL_REPEAT; c++) rows.push(...f)
    return rows
  })

  // reflect the selection onto the server-rendered grid + filter buttons.
  // "all" (data-tag="*") is active only when nothing is selected.
  createEffect(() => {
    const sel = selected()
    const shown: HTMLButtonElement[] = []
    const hidden: HTMLButtonElement[] = []
    props.gridButtons.forEach((btn) => {
      const tags = (btn.dataset.tags ?? '').split(' ').filter(Boolean)
      const show = sel.length === 0 || tags.some((t) => sel.includes(t))
      btn.classList.toggle('hidden', !show)
      ;(show ? shown : hidden).push(btn)
    })
    // move visible frames to the front so the `:nth-child` scatter (widths +
    // margins) keys off *visible* position — display:none siblings still count
    // toward nth-child, which otherwise scrambles the column layout on filter
    const parent = props.gridButtons[0]?.parentElement
    ;[...shown, ...hidden].forEach((btn) => parent?.appendChild(btn))
    props.tagButtons.forEach((btn) => {
      const tag = btn.dataset.tag ?? '*'
      const on = tag === '*' ? sel.length === 0 : sel.includes(tag)
      btn.classList.toggle('active', on)
      btn.setAttribute('aria-pressed', String(on))
    })
  })

  // reflect the disclosure state onto the tag list + toggle caret
  createEffect(() => {
    const isOpen = expanded()
    props.tagList?.toggleAttribute('hidden', !isOpen)
    props.toggle?.setAttribute('aria-expanded', String(isOpen))
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
      // seamless loop: re-home the scroll to the middle copy whenever the
      // centred thumb crosses into an adjacent copy. This keeps (RAIL_REPEAT-1)/2
      // copies of runway on *both* sides, so neither direction ever reaches the
      // scroll wall. (A fixed near-the-end threshold could sit past the maximum
      // scroll offset when the thumbs are tall — that stranded downward scroll.)
      let wrapped = false
      if (oneSet > 0 && performance.now() >= noRebaseUntil) {
        const p = railPos(el)
        const centre = p + railViewport(el) / 2
        const copy = Math.floor((centre - kidStart(kids[0] as HTMLElement)) / oneSet)
        const shift = copy - RAIL_MID
        if (shift !== 0) {
          setRailPos(el, p - shift * oneSet)
          wrapped = true
        }
      }
      // the rebase swaps which DOM thumb is centred; paint that frame without
      // the damping transition so it doesn't animate into a visible pop
      if (wrapped) {
        el.classList.add('noAnim')
        requestAnimationFrame(() => el.classList.remove('noAnim'))
      }

      // each thumb rises out of the strip as it nears centre: scale up, lift
      // toward the stage, and fade in — a proximity effect, so it reads as a
      // continuous response to the scroll rather than a binary highlight
      const mid = railPos(el) + railViewport(el) / 2
      const range = (oneSet / n) * 1.3 // falloff over ~1.3 thumbs
      let best = 0
      let bestDist = Infinity
      for (let i = 0; i < kids.length; i++) {
        const k = kids[i] as HTMLElement
        const dist = Math.abs(kidStart(k) + kidSize(k) / 2 - mid)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
        // smoothstep of nearness in [0,1]
        const near = Math.max(0, 1 - dist / range)
        const t = near * near * (3 - 2 * near)
        if (!reduceMotion) {
          const lift = RAIL_LIFT * t
          k.style.transform = vertical
            ? `translateX(${lift}px) scale(${1 + RAIL_GROW * t})`
            : `translateY(${-lift}px) scale(${1 + RAIL_GROW * t})`
        }
        k.style.opacity = String(RAIL_FADE + (1 - RAIL_FADE) * t)
        k.style.zIndex = t > 0.02 ? String(Math.round(t * 100) + 1) : '0'
      }
      setRailIndex(best)
      setPos(best % n)
    })
  }

  const next = (): void => scrollToRail(railIndex() + 1, true)
  const prev = (): void => scrollToRail(railIndex() - 1, true)
  const goTo = (flat: number): void => scrollToRail(flat, true)

  const openAt = (btn: HTMLButtonElement): void => {
    if (mobile) {
      stage?.open(Number(btn.dataset.index ?? 0))
      return
    }
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

  // trap focus/AT inside the viewer, but keep the site nav live: the grid
  // viewer intentionally overlays the nav (counter + menu links stay usable),
  // so inert only the content *behind* it — the grid/filter (all inside
  // `.grid`) plus analytics — not the whole page. inert on an ancestor can't
  // be undone on a child, so inert-ing `#main` would kill the nested nav.
  const inertBehind = (on: boolean): void => {
    document.querySelector('.grid')?.toggleAttribute('inert', on)
    document.querySelector('.analytics')?.toggleAttribute('inert', on)
  }
  createEffect(() => {
    const isOpen = open()
    inertBehind(isOpen)
    if (isOpen) viewer?.focus()
  })
  onCleanup(() => inertBehind(false))

  // on open: centre the starting thumb instantly, then follow the rail's own
  // scrolling (wheel/touch) to move the stage and keep the loop seamless
  createEffect(() => {
    if (!open() || rail == null) return
    const el = rail
    requestAnimationFrame(() => {
      scrollToRail(untrack(railIndex), false)
      onRailScroll() // paint the initial rise even if the scroll didn't move
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
      btn.addEventListener(
        'click',
        () => {
          const tag = btn.dataset.tag ?? '*'
          if (tag === '*') {
            setSelected([]) // "all" clears the selection
            return
          }
          setSelected((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
          )
        },
        { signal }
      )
    )
    props.toggle?.addEventListener('click', () => setExpanded((e) => !e), { signal })
    window.addEventListener('keydown', onKey, { signal })
    window.addEventListener('wheel', onWheel, { signal, passive: false })
    onCleanup(() => c.abort())
  })

  return (
    <Show when={open()}>
      <div
        ref={viewer}
        class="gridViewer"
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        tabIndex={-1}
      >
        <ol ref={rail} class="gridRail" aria-label="Thumbnails">
          {/* Index (not For): railRows repeats the set RAIL_REPEAT times, so it
              holds duplicate item references — Index keys by position, which is
              exactly what a repeated loop is. */}
          <Index each={railRows()}>
            {(row, i) => {
              const active = (): boolean => i === railIndex()
              // only the middle copy is exposed to assistive tech / tab order;
              // the other RAIL_REPEAT-1 copies exist solely for the visual loop,
              // so hide them or a screen reader hears every thumb RAIL_REPEAT times
              const primary = (): boolean =>
                Math.floor(i / filtered().length) === RAIL_MID
              return (
                <li aria-hidden={primary() ? undefined : 'true'}>
                  <button
                    class="gridRailItem"
                    classList={{ active: active() }}
                    type="button"
                    tabindex={primary() ? undefined : -1}
                    aria-current={active() ? 'true' : undefined}
                    onClick={() => goTo(i)}
                  >
                    <img
                      src={row().thumbUrl}
                      width={row().hiW}
                      height={row().hiH}
                      alt={row().caption}
                      loading="lazy"
                      draggable="false"
                    />
                  </button>
                </li>
              )
            }}
          </Index>
        </ol>

        {/* clicking the stage closes (journal-lightbox style); the custom
            "close" cursor supplies the affordance in place of a button */}
        <div
          class="gridStage"
          onClick={close}
          onMouseEnter={() => setOverStage(true)}
          onMouseLeave={() => setOverStage(false)}
        >
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
              onClick={(e) => {
                e.stopPropagation() // don't let the arrow click close the stage
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
        <CustomCursor
          active={() => open() && overStage()}
          cursorText={() => props.closeText}
        />
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
  const toggle = main.querySelector<HTMLButtonElement>('.gridFilterToggle')
  const tagList = main.querySelector<HTMLElement>('.gridTagList')

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
        toggle={toggle}
        tagList={tagList}
        root={root}
        closeText={ds?.close ?? 'close'}
        loadingText={ds?.loading ?? 'loading'}
        nextText={ds?.next ?? 'next'}
        prevText={ds?.prev ?? 'prev'}
      />
    ),
    root
  )
}
