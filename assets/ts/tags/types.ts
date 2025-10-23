/**
 * Tags System Types
 */

export interface TaggedImage {
  // Image data
  loRes: string
  hiRes: string
  width: number
  height: number
  alt?: string

  // Source information
  source: string // Gallery or collection name
  sourceType: 'gallery' | 'collection'
  sourcePermalink: string
  date: string // Publication date for sorting

  // Tags
  tags: string[]

  // Index in source (for stage navigation)
  sourceIndex: number
}

export interface FilterState {
  selectedTags: Set<string>
  searchQuery: string
}

export interface TagsData {
  images: TaggedImage[]
  allTags: string[]
}
