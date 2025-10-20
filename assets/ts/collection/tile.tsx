import { type JSX, createSignal, onCleanup, createEffect } from 'solid-js'

import type { CollectionData } from './types'
import type { TilePosition } from './layout'

// Configurable delay for image cycling and title rotation (in milliseconds)
const CYCLE_DELAY_MS = 500

interface TileProps {
  collection: CollectionData
  isMobile: boolean
  position?: TilePosition // Optional absolute positioning
  onPositionUpdate?: (x: number, y: number) => void // Callback to update position (desktop only)
  onBringToFront?: () => void // Callback to bring tile to front (desktop only)
}

export default function CollectionTile(props: TileProps): JSX.Element {
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0)
  const [isHovering, setIsHovering] = createSignal(false)
  const [isTouching, setIsTouching] = createSignal(false)
  const [isDragging, setIsDragging] = createSignal(false)
  let imageIntervalId: ReturnType<typeof setInterval> | null = null
  let dragOffset = { x: 0, y: 0 } // Offset from mouse to tile top-left

  // Image cycling on hover (desktop) or touch (mobile)
  createEffect(() => {
    const shouldCycle =
      props.collection.images.length > 1 &&
      ((isHovering() && !props.isMobile) || (isTouching() && props.isMobile))

    if (shouldCycle) {
      // Cycle through first 4 images
      imageIntervalId = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const maxIndex = Math.min(4, props.collection.images.length)
          return (prev + 1) % maxIndex
        })
      }, CYCLE_DELAY_MS)
    } else {
      // Reset to first image when not interacting
      if (imageIntervalId) {
        clearInterval(imageIntervalId)
        imageIntervalId = null
      }
      setCurrentImageIndex(0)
    }
  })

  // Cleanup interval on unmount
  onCleanup(() => {
    if (imageIntervalId) {
      clearInterval(imageIntervalId)
    }
  })

  const handleMouseEnter = (): void => {
    if (!props.isMobile) {
      setIsHovering(true)
    }
  }

  const handleMouseLeave = (): void => {
    if (!props.isMobile) {
      setIsHovering(false)
    }
  }

  const handleTouchStart = (): void => {
    if (props.isMobile) {
      setIsTouching(true)
    }
  }

  const handleTouchEnd = (): void => {
    if (props.isMobile) {
      setIsTouching(false)
    }
  }

  // Track if we actually dragged (to prevent click navigation)
  let hasDragged = false

  // Drag handlers (desktop only, with absolute positioning)
  const handleMouseDown = (e: MouseEvent): void => {
    // Only enable dragging on desktop with absolute positioning
    if (props.isMobile || !props.position || !props.onPositionUpdate || !props.onBringToFront) {
      return
    }

    // Prevent text selection during drag
    e.preventDefault()

    // Calculate offset from mouse position to tile's top-left corner
    dragOffset = {
      x: e.clientX - props.position.x,
      y: e.clientY - props.position.y
    }

    hasDragged = false // Reset drag flag
    setIsDragging(true)
    props.onBringToFront() // Bring to front when drag starts
  }

  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragging() || !props.onPositionUpdate || !props.position) {
      return
    }

    hasDragged = true // Mark that we've moved

    // Calculate new position based on mouse position and offset
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y

    props.onPositionUpdate(newX, newY)
  }

  const handleMouseUp = (): void => {
    if (isDragging()) {
      setIsDragging(false)
    }
  }

  // Setup global mouse listeners for drag
  createEffect(() => {
    if (isDragging()) {
      const handleGlobalMouseMove = (e: MouseEvent): void => handleMouseMove(e)
      const handleGlobalMouseUp = (): void => handleMouseUp()

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      onCleanup(() => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      })
    }
  })

  // Get current image with fallback
  const currentImage = (): string => {
    const img = props.collection.images[currentImageIndex()]
    return img?.loRes || props.collection.images[0]?.loRes || ''
  }

  // Calculate styles for absolute positioning if position prop is provided
  const tileStyles = (): Record<string, string> | undefined => {
    if (!props.position) return undefined
    return {
      position: 'absolute',
      left: `${props.position.x}px`,
      top: `${props.position.y}px`,
      width: `${props.position.width}px`,
      height: 'auto',
      'z-index': props.position.zIndex.toString(),
      cursor: isDragging() ? 'grabbing' : 'grab' // Show draggable cursor on desktop
    }
  }

  const imageStyles = (): Record<string, string> => {
    const baseStyles = {
      'object-position':
        currentImageIndex() > 0
          ? `${(props.collection.images[currentImageIndex()]?.width || props.collection.heroWidth) > (props.collection.images[currentImageIndex()]?.height || props.collection.heroHeight) ? '50%' : '50%'} 50%`
          : '50% 50%'
    }

    // If position is provided, we need to set the image dimensions explicitly
    if (props.position) {
      return {
        ...baseStyles,
        width: `${props.position.width}px`,
        height: `${props.position.height}px`
      }
    }

    return baseStyles
  }

  // Title text (computed once, not reactive)
  const titleText = props.collection.title.toUpperCase()

  return (
    <div
      class="collection-tile"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={tileStyles()}
    >
      <a
        href={props.collection.permalink}
        onClick={(e) => {
          // Prevent navigation if we dragged
          if (hasDragged) {
            e.preventDefault()
          }
        }}
      >
        <div
          class="tile-image"
          style={{
            'aspect-ratio': `${props.collection.heroWidth} / ${props.collection.heroHeight}`
          }}
        >
          <img
            src={currentImage()}
            alt={props.collection.title}
            loading="lazy"
            style={imageStyles()}
          />
        </div>

        {/* Title always at bottom - no rotation */}
        <div class="tile-title">{titleText}</div>
      </a>
    </div>
  )
}
