import { type JSX, createSignal, onMount, Show } from 'solid-js'
import { render } from 'solid-js/web'

import { ViewportProvider } from '../viewport'
import CollectionSingleView from './singleView'
import type { CollectionImage } from './types'

import '../../scss/collection-single.scss'

interface CollectionSingleData {
  title: string
  images: CollectionImage[]
}

function CollectionSingleApp(): JSX.Element {
  const [data, setData] = createSignal<CollectionSingleData | null>(null)

  onMount(() => {
    // Read collection single data from JSON script tag
    const dataElement = document.getElementById('collection-single-data')
    if (dataElement?.textContent) {
      try {
        const parsedData = JSON.parse(dataElement.textContent) as CollectionSingleData
        setData(parsedData)
      } catch (error) {
        console.error('Failed to parse collection single data:', error)
      }
    }
  })

  return (
    <Show when={data()}>
      <ViewportProvider>
        <CollectionSingleView title={data()!.title} images={data()!.images} />
      </ViewportProvider>
    </Show>
  )
}

// Initialize collection single app
const container = document.getElementById('collection-single-app')
if (container) {
  render(() => <CollectionSingleApp />, container)
}
