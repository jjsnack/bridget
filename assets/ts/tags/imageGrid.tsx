/**
 * Image Grid Component
 * Displays filtered images in a grid with infinite scroll
 */

import { type Component, For, createSignal, createEffect, onMount, Show } from 'solid-js'
import { GridTile } from './gridTile'
import type { TaggedImage, AspectRatioMode } from './types'

interface ImageGridProps {
  filteredImages: TaggedImage[]
  aspectRatioMode: AspectRatioMode
  onToggleAspectRatio: () => void
  onImageClick: (image: TaggedImage, index: number) => void
}

const ITEMS_PER_PAGE = 30

export const ImageGrid: Component<ImageGridProps> = (props) => {
  const [visibleCount, setVisibleCount] = createSignal(ITEMS_PER_PAGE)
  const [isLoading, setIsLoading] = createSignal(false)
  let gridRef: HTMLDivElement | undefined
  let observerRef: IntersectionObserver | undefined

  const visibleImages = () => props.filteredImages.slice(0, visibleCount())
  const hasMore = () => visibleCount() < props.filteredImages.length

  // Reset visible count when filtered images change
  createEffect(() => {
    props.filteredImages // track dependency
    setVisibleCount(ITEMS_PER_PAGE)
  })

  const loadMore = () => {
    if (isLoading() || !hasMore()) return

    setIsLoading(true)
    // Simulate async loading
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, props.filteredImages.length))
      setIsLoading(false)
    }, 100)
  }

  onMount(() => {
    // Set up intersection observer for infinite scroll
    observerRef = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore() && !isLoading()) {
          loadMore()
        }
      },
      { rootMargin: '400px' },
    )

    // Observe the sentinel element
    const sentinel = gridRef?.querySelector('.image-grid__sentinel')
    if (sentinel) {
      observerRef.observe(sentinel)
    }

    return () => {
      observerRef?.disconnect()
    }
  })

  return (
    <div class="image-grid" ref={gridRef}>
      {/* Controls Bar */}
      <div class="image-grid__controls">
        <div class="image-grid__count">
          {props.filteredImages.length} {props.filteredImages.length === 1 ? 'image' : 'images'}
        </div>
        <button class="image-grid__toggle" onClick={props.onToggleAspectRatio}>
          <span class="image-grid__toggle-label">Aspect ratio:</span>
          <span class="image-grid__toggle-value">
            {props.aspectRatioMode === 'natural' ? 'Natural' : 'Square'}
          </span>
        </button>
      </div>

      {/* Grid */}
      <div
        class="image-grid__container"
        classList={{
          'image-grid__container--natural': props.aspectRatioMode === 'natural',
          'image-grid__container--square': props.aspectRatioMode === 'square',
        }}
      >
        <For each={visibleImages()}>
          {(image, index) => (
            <GridTile
              image={image}
              aspectRatioMode={props.aspectRatioMode}
              onClick={() => props.onImageClick(image, index())}
            />
          )}
        </For>

        {/* Infinite Scroll Sentinel */}
        <div class="image-grid__sentinel" />
      </div>

      {/* Loading Indicator */}
      <Show when={isLoading() && hasMore()}>
        <div class="image-grid__loading">Loading more images...</div>
      </Show>

      {/* End Message */}
      <Show when={!hasMore() && props.filteredImages.length > ITEMS_PER_PAGE}>
        <div class="image-grid__end">All images loaded</div>
      </Show>

      {/* Empty State */}
      <Show when={props.filteredImages.length === 0}>
        <div class="image-grid__empty">
          <p>No images match the selected tags</p>
          <p class="image-grid__empty-hint">Try selecting different tags or clearing filters</p>
        </div>
      </Show>
    </div>
  )
}
