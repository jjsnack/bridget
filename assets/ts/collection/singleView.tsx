import { type JSX, For } from 'solid-js'

import type { CollectionImage } from './types'

interface SingleViewProps {
  title: string
  images: CollectionImage[]
}

export default function CollectionSingleView(props: SingleViewProps): JSX.Element {
  return (
    <div class="collection-single-view">
      <div class="collection-single-images">
        <For each={props.images}>
          {(image) => (
            <div class="collection-single-image-wrapper">
              <img
                src={image.hiRes}
                alt={props.title}
                loading="lazy"
                style={{
                  'aspect-ratio': `${image.width} / ${image.height}`
                }}
              />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
