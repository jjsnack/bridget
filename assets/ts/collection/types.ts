/**
 * Collection Types
 */

export interface CollectionImage {
  loRes: string
  hiRes: string
  width: number
  height: number
}

export interface CollectionData {
  title: string
  permalink: string
  heroWidth: number
  heroHeight: number
  images: CollectionImage[]
}

export interface TilePosition {
  x: number
  y: number
  isDragged: boolean
  zIndex: number
}
