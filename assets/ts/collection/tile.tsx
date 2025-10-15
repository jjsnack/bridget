import { type JSX, createSignal, onCleanup, createEffect } from 'solid-js'

import type { CollectionData } from './types'

interface TileProps {
  collection: CollectionData
  isMobile: boolean
}

export default function CollectionTile(props: TileProps): JSX.Element {
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0)
  const [isHovering, setIsHovering] = createSignal(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  // Image cycling on hover (desktop only)
  createEffect(() => {
    if (isHovering() && !props.isMobile && props.collection.images.length > 1) {
      // Cycle through first 4 images every 500ms
      intervalId = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const maxIndex = Math.min(4, props.collection.images.length)
          return (prev + 1) % maxIndex
        })
      }, 500)
    } else {
      // Reset to first image when not hovering
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      setCurrentImageIndex(0)
    }
  })

  // Cleanup interval on unmount
  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId)
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

  // Calculate which edge the title should be on (0=bottom, 1=right, 2=top, 3=left)
  const titlePosition = (): number => currentImageIndex() % 4

  // Get current image with fallback
  const currentImage = (): string => {
    const img = props.collection.images[currentImageIndex()]
    return img?.loRes || props.collection.images[0]?.loRes || ''
  }

  return (
    <div
      class="collection-tile"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
            style={{
              'object-position':
                currentImageIndex() > 0
                  ? `${(props.collection.images[currentImageIndex()]?.width || props.collection.heroWidth) > (props.collection.images[currentImageIndex()]?.height || props.collection.heroHeight) ? '50%' : '50%'} 50%`
                  : '50% 50%'
            }}
          />
        </div>
        <div
          class="tile-title"
          classList={{
            'position-bottom': titlePosition() === 0,
            'position-right': titlePosition() === 1,
            'position-top': titlePosition() === 2,
            'position-left': titlePosition() === 3,
            rotating: isHovering() && !props.isMobile
          }}
        >
          {props.collection.title.toUpperCase()}
        </div>
      </a>
    </div>
  )
}
