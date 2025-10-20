import { type JSX, createSignal, onCleanup, createEffect } from 'solid-js'

import type { CollectionData } from './types'
import type { TilePosition } from './layout'

// Configurable delay for image cycling and title rotation (in milliseconds)
const CYCLE_DELAY_MS = 500

interface TileProps {
  collection: CollectionData
  isMobile: boolean
  position?: TilePosition // Optional absolute positioning
}

export default function CollectionTile(props: TileProps): JSX.Element {
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0)
  const [titlePositionIndex, setTitlePositionIndex] = createSignal(0)
  const [isHovering, setIsHovering] = createSignal(false)
  const [isTouching, setIsTouching] = createSignal(false)
  let imageIntervalId: ReturnType<typeof setInterval> | null = null
  let titleIntervalId: ReturnType<typeof setInterval> | null = null

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

  // Title rotation on hover (desktop only)
  createEffect(() => {
    const shouldRotate = isHovering() && !props.isMobile

    if (shouldRotate) {
      // Rotate through 4 positions (bottom, right, top, left)
      titleIntervalId = setInterval(() => {
        setTitlePositionIndex((prev) => (prev + 1) % 4)
      }, CYCLE_DELAY_MS)
    } else {
      // Reset to bottom position when not hovering
      if (titleIntervalId) {
        clearInterval(titleIntervalId)
        titleIntervalId = null
      }
      setTitlePositionIndex(0)
    }
  })

  // Cleanup intervals on unmount
  onCleanup(() => {
    if (imageIntervalId) {
      clearInterval(imageIntervalId)
    }
    if (titleIntervalId) {
      clearInterval(titleIntervalId)
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

  // Calculate which edge the title should be on (0=bottom, 1=right, 2=top, 3=left)
  // On mobile, always return 0 (bottom) to prevent rotation
  const titlePosition = (): number => {
    if (props.isMobile) return 0
    return titlePositionIndex()
  }

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
      'z-index': props.position.zIndex.toString()
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

  return (
    <div
      class="collection-tile"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={tileStyles()}
    >
      <a href={props.collection.permalink}>
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
        <div
          class="tile-title"
          classList={{
            'position-bottom': !props.isMobile && titlePosition() === 0,
            'position-right': !props.isMobile && titlePosition() === 1,
            'position-top': !props.isMobile && titlePosition() === 2,
            'position-left': !props.isMobile && titlePosition() === 3,
            rotating: isHovering() && !props.isMobile
          }}
        >
          {props.collection.title.toUpperCase()}
        </div>
      </a>
    </div>
  )
}
