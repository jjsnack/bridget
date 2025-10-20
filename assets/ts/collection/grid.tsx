import { type JSX, For, createSignal, createEffect, onMount, onCleanup } from 'solid-js'

import { useViewport } from '../viewport'
import CollectionTile from './tile'
import { calculateTilePositions, type TilePosition } from './layout'
import type { CollectionData } from './types'

interface CollectionGridProps {
  collections: CollectionData[]
}

export default function CollectionGrid(props: CollectionGridProps): JSX.Element {
  // Detect if device is mobile (no hover capability)
  const isMobile =
    window.matchMedia('(hover: none)').matches && !window.navigator.userAgent.includes('Win')

  // Get viewport context
  const [preset, config] = useViewport()

  // Store calculated positions for absolute layout
  const [positions, setPositions] = createSignal<TilePosition[]>([])
  const [containerHeight, setContainerHeight] = createSignal(3000) // Default height, will be calculated

  // Track window dimensions to trigger recalculation on resize
  const [windowDimensions, setWindowDimensions] = createSignal({
    width: window.innerWidth,
    height: window.innerHeight
  })

  // Setup resize listener with debouncing
  onMount(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null

    const handleResize = (): void => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }

      resizeTimeout = setTimeout(() => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }, 200) // 200ms debounce
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      window.removeEventListener('resize', handleResize)
    }
  })

  // Track z-index counter for drag recency ordering
  let zIndexCounter = 100

  // Calculate positions when preset, window dimensions, or collections change
  createEffect(() => {
    const currentPreset = preset()
    const currentConfig = config()
    const dimensions = windowDimensions() // Track window dimensions

    // Only calculate positions for non-mobile layouts
    if (currentPreset !== 'mobile' && currentConfig.collectionBaseTileWidth) {
      // Get container dimensions
      const containerWidth = dimensions.width
      const estimatedHeight = Math.max(3000, props.collections.length * 600)

      // Calculate positions
      const calculatedPositions = calculateTilePositions(
        props.collections,
        containerWidth,
        estimatedHeight,
        currentConfig.collectionBaseTileWidth
      )

      setPositions(calculatedPositions)

      // Calculate actual container height based on positioned tiles
      const maxY = calculatedPositions.reduce(
        (max, pos) => Math.max(max, pos.y + pos.height),
        0
      )
      setContainerHeight(maxY + 100) // Add some bottom padding
    }
  })

  // Update position of a specific tile (for drag)
  const updateTilePosition = (index: number, x: number, y: number): void => {
    setPositions((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          x,
          y
        }
      }
      return updated
    })
  }

  // Bring tile to front (increment z-index)
  const bringToFront = (index: number): void => {
    zIndexCounter++
    setPositions((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          zIndex: zIndexCounter
        }
      }
      return updated
    })
  }

  // Determine if we should use absolute positioning layout
  const useAbsoluteLayout = (): boolean => {
    return preset() !== 'mobile' && config().collectionBaseTileWidth !== undefined
  }

  return (
    <div
      class="collection-grid"
      classList={{
        'collection-grid--absolute': useAbsoluteLayout()
      }}
      style={
        useAbsoluteLayout()
          ? {
              position: 'relative',
              'min-height': `${containerHeight()}px`
            }
          : undefined
      }
    >
      <For each={props.collections}>
        {(collection, index) => (
          <CollectionTile
            collection={collection}
            isMobile={isMobile}
            preset={preset()}
            position={useAbsoluteLayout() ? positions()[index()] : undefined}
            onPositionUpdate={
              useAbsoluteLayout() && !isMobile
                ? (x: number, y: number) => updateTilePosition(index(), x, y)
                : undefined
            }
            onBringToFront={
              useAbsoluteLayout() && !isMobile ? () => bringToFront(index()) : undefined
            }
          />
        )}
      </For>
    </div>
  )
}
