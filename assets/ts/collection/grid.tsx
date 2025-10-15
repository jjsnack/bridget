import { type JSX, For } from 'solid-js'

import CollectionTile from './tile'
import type { CollectionData } from './types'

interface CollectionGridProps {
  collections: CollectionData[]
}

export default function CollectionGrid(props: CollectionGridProps): JSX.Element {
  // Detect if device is mobile (no hover capability)
  const isMobile =
    window.matchMedia('(hover: none)').matches && !window.navigator.userAgent.includes('Win')

  return (
    <div class="collection-grid">
      <For each={props.collections}>
        {(collection) => <CollectionTile collection={collection} isMobile={isMobile} />}
      </For>
    </div>
  )
}
