/**
 * Tag Browser Component
 * Main coordinator for the tags page - manages filtering, grid, and stage/gallery integration
 */

import { type Component, createSignal, createMemo, createEffect, lazy, Show } from 'solid-js'
import { TagFilter } from './tagFilter'
import { ImageGrid } from './imageGrid'
import type { TagsData, TaggedImage, FilterState, AspectRatioMode } from './types'
import type { ImageJSON } from '../resources'

// Lazy load stage/gallery for better initial load
const Stage = lazy(() => import('../desktop/stage'))
const StageNav = lazy(() => import('../desktop/stageNav'))
const Gallery = lazy(() => import('../mobile/gallery'))

interface TagBrowserProps {
  data: TagsData
  isMobile: boolean
  closeText: string
  prevText: string
  nextText: string
  loadingText: string
}

export const TagBrowser: Component<TagBrowserProps> = (props) => {
  // Filter state
  const [filterState, setFilterState] = createSignal<FilterState>({
    selectedTags: new Set(),
    searchQuery: '',
  })

  // Grid display mode
  const [aspectRatioMode, setAspectRatioMode] = createSignal<AspectRatioMode>('natural')

  // Stage/Gallery state
  const [isStageOpen, setIsStageOpen] = createSignal(false)
  const [isAnimating, setIsAnimating] = createSignal(false)
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0)
  const [scrollable, setScrollable] = createSignal(true)

  // Filter images based on selected tags
  const filteredImages = createMemo(() => {
    const state = filterState()
    if (state.selectedTags.size === 0) {
      return props.data.images
    }

    return props.data.images.filter((image) =>
      Array.from(state.selectedTags).every((tag) => image.tags.includes(tag)),
    )
  })

  // Convert TaggedImage[] to ImageJSON[] for Stage/Gallery components
  const imageJSONArray = createMemo<ImageJSON[]>(() => {
    return filteredImages().map((img, idx) => ({
      index: idx,
      alt: img.alt || `Image from ${img.source}`,
      loUrl: img.loRes,
      loImgH: img.height,
      loImgW: img.width,
      hiUrl: img.hiRes,
      hiImgH: img.height,
      hiImgW: img.width,
    }))
  })

  // Filter handlers
  const handleToggleTag = (tag: string) => {
    setFilterState((prev) => {
      const newSelectedTags = new Set(prev.selectedTags)
      if (newSelectedTags.has(tag)) {
        newSelectedTags.delete(tag)
      } else {
        newSelectedTags.add(tag)
      }
      return { ...prev, selectedTags: newSelectedTags }
    })
  }

  const handleSearchChange = (query: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: query }))
  }

  const handleClearFilters = () => {
    setFilterState({ selectedTags: new Set(), searchQuery: '' })
  }

  // Grid handlers
  const handleToggleAspectRatio = () => {
    setAspectRatioMode((prev) => (prev === 'natural' ? 'square' : 'natural'))
  }

  const handleImageClick = (_image: TaggedImage, index: number) => {
    setCurrentImageIndex(index)
    setIsStageOpen(true)
    if (props.isMobile) {
      setScrollable(false)
    }
  }

  // Body scroll control for mobile
  createEffect(() => {
    if (props.isMobile) {
      document.body.style.overflow = scrollable() ? 'auto' : 'hidden'
    }
  })

  return (
    <div class="tag-browser">
      <TagFilter
        allTags={props.data.allTags}
        filterState={filterState()}
        onToggleTag={handleToggleTag}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      <ImageGrid
        filteredImages={filteredImages()}
        aspectRatioMode={aspectRatioMode()}
        onToggleAspectRatio={handleToggleAspectRatio}
        onImageClick={handleImageClick}
      />

      {/* Desktop Stage View */}
      <Show when={!props.isMobile && isStageOpen()}>
        <Stage
          ijs={imageJSONArray()}
          initialIndex={currentImageIndex()}
          isOpen={isStageOpen}
          setIsOpen={setIsStageOpen}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          loadingText={props.loadingText}
        />
        <StageNav
          prevText={props.prevText}
          closeText={props.closeText}
          nextText={props.nextText}
          isOpen={isStageOpen}
          setIsOpen={setIsStageOpen}
        />
      </Show>

      {/* Mobile Gallery View */}
      <Show when={props.isMobile && isStageOpen()}>
        <Gallery
          ijs={imageJSONArray()}
          closeText={props.closeText}
          loadingText={props.loadingText}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          isOpen={isStageOpen}
          setIsOpen={setIsStageOpen}
          setScrollable={setScrollable}
        />
      </Show>
    </div>
  )
}
