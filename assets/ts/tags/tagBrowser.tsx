/**
 * Tag Browser Component
 * Main coordinator for the tags page - manages filtering, grid, and stage/gallery integration
 */

import { type Component, createSignal, createMemo, createEffect, lazy, Show } from 'solid-js'
import { TagFilter } from './tagFilter'
import { ImageGrid } from './imageGrid'
import type { TagsData, TaggedImage, FilterState } from './types'
import type { ImageJSON } from '../resources'
import type { HistoryItem } from '../desktop/layout'
import type { Vector } from '../utils'

// Lazy load components for better initial load
const Stage = lazy(() => import('../desktop/stage'))
const StageNav = lazy(() => import('../desktop/stageNav'))
const CustomCursor = lazy(() => import('../desktop/customCursor'))
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

  // Desktop Stage state (matching desktop/layout.tsx pattern)
  const [cordHist, setCordHist] = createSignal<HistoryItem[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [isOpen, setIsOpen] = createSignal(false)
  const [isAnimating, setIsAnimating] = createSignal(false)
  const [hoverText, setHoverText] = createSignal('')
  const [navVector, setNavVector] = createSignal<Vector>('none')

  // Mobile state
  const [scrollable, setScrollable] = createSignal(true)

  // Computed values for Stage
  const active = createMemo(() => isOpen() && !isAnimating())
  const cursorText = createMemo(() => (isLoading() ? props.loadingText : hoverText()))

  // Filter images based on selected tags and sort by recency
  const filteredImages = createMemo(() => {
    const state = filterState()
    let images = props.data.images

    // Filter by tags if any are selected
    if (state.selectedTags.size > 0) {
      images = images.filter((image) =>
        Array.from(state.selectedTags).every((tag) => image.tags.includes(tag)),
      )
    }

    // Sort by date (most recent first)
    return [...images].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
  const handleImageClick = (image: TaggedImage, index: number) => {
    // Initialize cordHist with the clicked image position
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    setCordHist([{ i: index, x: centerX, y: centerY }])

    setIsOpen(true)

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

      <ImageGrid filteredImages={filteredImages()} onImageClick={handleImageClick} />

      {/* Desktop Stage View with Custom Cursor */}
      <Show when={!props.isMobile}>
        <Stage
          ijs={imageJSONArray()}
          setIsLoading={setIsLoading}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          cordHist={cordHist}
          setCordHist={setCordHist}
          navVector={navVector}
          setNavVector={setNavVector}
        />
        <Show when={isOpen()}>
          <CustomCursor cursorText={cursorText} active={active} isOpen={isOpen} />
          <StageNav
            prevText={props.prevText}
            closeText={props.closeText}
            nextText={props.nextText}
            loadingText={props.loadingText}
            active={active}
            isAnimating={isAnimating}
            setCordHist={setCordHist}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setHoverText={setHoverText}
            navVector={navVector}
            setNavVector={setNavVector}
          />
        </Show>
      </Show>

      {/* Mobile Gallery View */}
      <Show when={props.isMobile && isOpen()}>
        <Gallery
          ijs={imageJSONArray()}
          closeText={props.closeText}
          loadingText={props.loadingText}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setScrollable={setScrollable}
        />
      </Show>
    </div>
  )
}
