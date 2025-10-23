/**
 * Grid Tile Component
 * Individual image tile in the tags grid
 */

import { type Component, createSignal, onMount, Show } from 'solid-js'
import type { TaggedImage, AspectRatioMode } from './types'

interface GridTileProps {
  image: TaggedImage
  aspectRatioMode: AspectRatioMode
  onClick: () => void
}

export const GridTile: Component<GridTileProps> = (props) => {
  const [loaded, setLoaded] = createSignal(false)
  const [imgSrc, setImgSrc] = createSignal(props.image.loRes)

  const aspectRatio = () => {
    if (props.aspectRatioMode === 'square') return 1
    return props.image.width / props.image.height
  }

  onMount(() => {
    // Load low-res first, then high-res
    const img = new Image()
    img.src = props.image.loRes
    img.onload = () => {
      setLoaded(true)
      // Start loading high-res
      const hiResImg = new Image()
      hiResImg.src = props.image.hiRes
      hiResImg.onload = () => {
        setImgSrc(props.image.hiRes)
      }
    }
  })

  return (
    <button
      class="grid-tile"
      onClick={props.onClick}
      classList={{
        'grid-tile--loaded': loaded(),
        'grid-tile--square': props.aspectRatioMode === 'square',
        'grid-tile--natural': props.aspectRatioMode === 'natural',
      }}
      style={{ 'aspect-ratio': aspectRatio().toString() }}
    >
      <Show when={loaded()} fallback={<div class="grid-tile__loader" />}>
        <img
          src={imgSrc()}
          alt={props.image.alt || `Image from ${props.image.source}`}
          class="grid-tile__image"
          classList={{
            'grid-tile__image--square': props.aspectRatioMode === 'square',
          }}
        />
        <div class="grid-tile__overlay">
          <span class="grid-tile__source">{props.image.source}</span>
        </div>
      </Show>
    </button>
  )
}
