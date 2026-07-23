import { Index, Show, createMemo, type JSX } from 'solid-js'

import { useImageState } from '../imageState'
import { expand } from '../utils'

import { useMobileState } from './state'

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function GalleryNav(props: {
  children?: JSX.Element
  closeText: string
  counter?: boolean
}): JSX.Element {
  // states
  const imageState = useImageState()
  const [mobile, { setIsOpen }] = useMobileState()
  const indexValue = createMemo(() => expand(mobile.index() + 1))
  const indexLength = createMemo(() => expand(imageState().length))

  const onClick: () => void = () => {
    if (mobile.isAnimating()) return
    setIsOpen(false)
  }

  return (
    <>
      <div class="nav">
        <Show when={props.counter !== false} fallback={<div />}>
          <div>
            <Index each={[...indexValue()]}>
              {(d) => <span class="num">{d()}</span>}
            </Index>
            <span>/</span>
            <Index each={[...indexLength()]}>
              {(d) => <span class="num">{d()}</span>}
            </Index>
          </div>
        </Show>
        <button class="navClose" onClick={onClick}>
          {capitalizeFirstLetter(props.closeText)}
        </button>
      </div>
    </>
  )
}
