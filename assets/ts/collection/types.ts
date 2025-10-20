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

/**
 * TilePosition is defined in layout.ts and should be imported from there
 * when absolute positioning is needed
 */
