import { type JSX, For } from 'solid-js'

import type { CollectionData } from './types'

interface CollectionGridProps {
  collections: CollectionData[]
}

export default function CollectionGrid(props: CollectionGridProps): JSX.Element {
  return (
    <div class="collection-grid">
      <For each={props.collections}>
        {(collection) => (
          <div class="collection-tile">
            <a href={collection.permalink}>
              <div
                class="tile-image"
                style={{
                  'aspect-ratio': `${collection.heroWidth} / ${collection.heroHeight}`
                }}
              >
                <img
                  src={collection.images[0]?.loRes}
                  alt={collection.title}
                  loading="lazy"
                />
              </div>
              <div class="tile-title">{collection.title.toUpperCase()}</div>
            </a>
          </div>
        )}
      </For>
    </div>
  )
}
