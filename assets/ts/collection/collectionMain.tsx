import { type JSX, createSignal, onMount, Show } from 'solid-js'
import { render } from 'solid-js/web'

import { ViewportProvider } from '../viewport'
import CollectionGrid from './grid'
import type { CollectionData } from './types'

import '../../scss/collection.scss'

function CollectionApp(): JSX.Element {
  const [collections, setCollections] = createSignal<CollectionData[]>([])

  onMount(() => {
    // Read collection data from JSON script tag
    const dataElement = document.getElementById('collection-data')
    if (dataElement?.textContent) {
      try {
        const data = JSON.parse(dataElement.textContent) as CollectionData[]
        setCollections(data)
      } catch (error) {
        console.error('Failed to parse collection data:', error)
      }
    }
  })

  return (
    <Show when={collections().length > 0}>
      <ViewportProvider>
        <CollectionGrid collections={collections()} />
      </ViewportProvider>
    </Show>
  )
}

// Initialize collection app
const container = document.getElementById('collection-app')
if (container) {
  render(() => <CollectionApp />, container)
}
