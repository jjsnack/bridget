import { type JSX, For, Show } from 'solid-js'

import type { CollectionImage } from './types'

interface SingleViewProps {
  title: string
  content?: string
  images: CollectionImage[]
}

export default function CollectionSingleView(props: SingleViewProps): JSX.Element {
  return (
    <div class="collection-single-view">
      {/* Display content if available */}
      <Show when={props.content && props.content.trim().length > 0}>
        <article
          class="collection-single-content"
          innerHTML={props.content}
        />
      </Show>

      {/* Display images */}
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
