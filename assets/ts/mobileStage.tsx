import { onMount, type JSX } from 'solid-js'
import { render } from 'solid-js/web'

import { ImageStateProvider } from './imageState'
import Gallery from './mobile/gallery'
import { MobileStateProvider, useMobileState } from './mobile/state'
import { type ImageJSON } from './resources'

export interface MobileStage {
  open: (index: number) => void
  dispose: () => void
}

// Grabs the mobile-state setters from inside the providers and hands an
// imperative `open` back to the (non-Solid) caller in post/grid.
function Bridge(props: {
  onReady: (open: (index: number) => void) => void
  closeText: string
  loadingText: string
}): JSX.Element {
  const [, { setIndex, setIsOpen }] = useMobileState()
  onMount(() =>
    props.onReady((index) => {
      setIndex(index)
      setIsOpen(true)
    })
  )
  return <Gallery closeText={props.closeText} loadingText={props.loadingText} />
}

/**
 * Reuse the scatter gallery's mobile focus view (the slide-up swiper curtain)
 * as a standalone lightbox for the post and grid archetypes. Builds its own
 * provider tree so it stays independent of the page's other islands; `images`
 * must be ordered so each entry's `index` equals its position (the swiper
 * realIndex the gallery tracks).
 */
export function mountMobileStage(
  images: ImageJSON[],
  closeText: string,
  loadingText: string
): MobileStage {
  const root = document.createElement('div')
  root.className = 'mobileStageRoot'
  document.body.appendChild(root)

  let open: (index: number) => void = () => {}
  const dispose = render(
    () => (
      <ImageStateProvider images={images}>
        <MobileStateProvider>
          <Bridge
            onReady={(fn) => (open = fn)}
            closeText={closeText}
            loadingText={loadingText}
          />
        </MobileStateProvider>
      </ImageStateProvider>
    ),
    root
  )

  return {
    open: (index) => open(index),
    dispose: () => {
      dispose()
      root.remove()
    }
  }
}
