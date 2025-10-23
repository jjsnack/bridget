/**
 * Tag Filter Component
 * Provides search, tag selection, and filter chips UI
 */

import { type Component, For, createSignal, createMemo } from 'solid-js'
import type { FilterState } from './types'

interface TagFilterProps {
  allTags: string[]
  filterState: FilterState
  onToggleTag: (tag: string) => void
  onSearchChange: (query: string) => void
  onClearFilters: () => void
}

export const TagFilter: Component<TagFilterProps> = (props) => {
  const [isTagListExpanded, setIsTagListExpanded] = createSignal(false)
  const [searchFocused, setSearchFocused] = createSignal(false)

  // Filter tags based on search query for autocomplete
  const filteredTags = createMemo(() => {
    if (!props.filterState.searchQuery) return props.allTags

    const query = props.filterState.searchQuery.toLowerCase()
    return props.allTags.filter((tag) => tag.toLowerCase().includes(query))
  })

  // Show autocomplete when search is focused and has results
  const showAutocomplete = createMemo(
    () => searchFocused() && props.filterState.searchQuery && filteredTags().length > 0,
  )

  const handleTagClick = (tag: string) => {
    props.onToggleTag(tag)
    // Clear search after selecting a tag
    props.onSearchChange('')
  }

  const selectedTagsArray = createMemo(() => Array.from(props.filterState.selectedTags))

  return (
    <div class="tag-filter">
      {/* Search Bar */}
      <div class="tag-filter__search-container">
        <input
          type="text"
          class="tag-filter__search"
          placeholder="Search tags..."
          value={props.filterState.searchQuery}
          onInput={(e) => props.onSearchChange(e.currentTarget.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
        />

        {/* Autocomplete Dropdown */}
        {showAutocomplete() && (
          <div class="tag-filter__autocomplete">
            <For each={filteredTags().slice(0, 10)}>
              {(tag) => (
                <button
                  class="tag-filter__autocomplete-item"
                  onClick={() => handleTagClick(tag)}
                  classList={{
                    'tag-filter__autocomplete-item--selected':
                      props.filterState.selectedTags.has(tag),
                  }}
                >
                  {tag}
                  {props.filterState.selectedTags.has(tag) && (
                    <span class="tag-filter__check">✓</span>
                  )}
                </button>
              )}
            </For>
          </div>
        )}
      </div>

      {/* Selected Tag Chips */}
      {selectedTagsArray().length > 0 && (
        <div class="tag-filter__chips">
          <For each={selectedTagsArray()}>
            {(tag) => (
              <button
                class="tag-filter__chip"
                onClick={() => props.onToggleTag(tag)}
                title={`Remove ${tag}`}
              >
                {tag}
                <span class="tag-filter__chip-remove">×</span>
              </button>
            )}
          </For>
          <button class="tag-filter__clear" onClick={props.onClearFilters}>
            Clear all
          </button>
        </div>
      )}

      {/* Expandable Tag List */}
      <div class="tag-filter__expand-container">
        <button
          class="tag-filter__expand-toggle"
          onClick={() => setIsTagListExpanded(!isTagListExpanded())}
        >
          {isTagListExpanded() ? 'Close tags' : 'Open tags'}
          <span class="tag-filter__expand-icon">{isTagListExpanded() ? '▼' : '▶'}</span>
        </button>

        {isTagListExpanded() && (
          <div class="tag-filter__tag-list">
            <For each={props.allTags}>
              {(tag) => (
                <button
                  class="tag-filter__tag-button"
                  onClick={() => handleTagClick(tag)}
                  classList={{
                    'tag-filter__tag-button--selected': props.filterState.selectedTags.has(tag),
                  }}
                >
                  {tag}
                </button>
              )}
            </For>
          </div>
        )}
      </div>
    </div>
  )
}
