/**
 * Tags Browser Entry Point
 * Initializes the tags page with TagBrowser component
 */

import { type JSX, createSignal, onMount, Show } from 'solid-js'
import { render } from 'solid-js/web'

import { ViewportProvider } from '../viewport'
import { TagBrowser } from './tagBrowser'
import type { TagsData } from './types'

import '../../scss/tags.scss'

interface TagsContainer extends HTMLDivElement {
  dataset: {
    prev: string
    close: string
    next: string
    loading: string
  }
}

function TagsApp(): JSX.Element {
  const [tagsData, setTagsData] = createSignal<TagsData | null>(null)

  // Detect mobile device
  const isMobile =
    window.matchMedia('(hover: none)').matches && !window.navigator.userAgent.includes('Win')

  // Get text translations from container
  const container = document.getElementById('tags-app') as TagsContainer
  const prevText = container?.dataset.prev || 'Prev'
  const closeText = container?.dataset.close || 'Close'
  const nextText = container?.dataset.next || 'Next'
  const loadingText = container?.dataset.loading || 'Loading'

  onMount(() => {
    // Read tags data from JSON script tag
    const dataElement = document.getElementById('tags-data')
    if (dataElement?.textContent) {
      try {
        const data = JSON.parse(dataElement.textContent) as TagsData
        setTagsData(data)
      } catch (error) {
        console.error('Failed to parse tags data:', error)
      }
    }
  })

  return (
    <Show when={tagsData()} fallback={<div class="tags-loading">Loading tags...</div>}>
      <ViewportProvider>
        <TagBrowser
          data={tagsData()!}
          isMobile={isMobile}
          closeText={closeText}
          prevText={prevText}
          nextText={nextText}
          loadingText={loadingText}
        />
      </ViewportProvider>
    </Show>
  )
}

// Initialize tags app
const container = document.getElementById('tags-app')
if (container) {
  render(() => <TagsApp />, container)
}
