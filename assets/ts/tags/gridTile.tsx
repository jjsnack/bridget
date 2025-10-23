/**
 * Grid Tile Component
 * Individual image tile in the tags grid (always square)
 */

import { type Component, createSignal, onMount, Show } from 'solid-js'
import type { TaggedImage } from './types'

interface GridTileProps {
  image: TaggedImage
  onClick: () => void
}

export const GridTile: Component<GridTileProps> = (props) => {
  const [loaded, setLoaded] = createSignal(false)
  const [imgSrc, setImgSrc] = createSignal(props.image.loRes)

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
    <button class="grid-tile" onClick={props.onClick} classList={{ 'grid-tile--loaded': loaded() }}>
      <Show when={loaded()} fallback={<div class="grid-tile__loader" />}>
        <img
          src={imgSrc()}
          alt={props.image.alt || `Image from ${props.image.source}`}
          class="grid-tile__image"
        />
        <div class="grid-tile__overlay">
          <span class="grid-tile__source">{props.image.source}</span>
        </div>
      </Show>
    </button>
  )
}
