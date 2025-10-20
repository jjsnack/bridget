/**
 * Viewport Aspect-Ratio Preset Configuration
 *
 * This file defines preset configurations for different viewport aspect ratios.
 * All dynamic layout values should be defined here for centralized management.
 */

export type PresetName = 'mobile' | 'portrait' | 'square' | 'landscape'

export interface PresetConfig {
  // Navigation
  navHeight: string
  navFontSize: string
  navPadding: string
  navPosition: 'top' | 'bottom'

  // Stage & Gallery
  stageImageScale: number
  collectionGap: string
  collectionImageWidth: string
  collectionImageHeight: string
  collectionTopPadding: string
  collectionStickyTop: string

  // Collection Grid
  collectionGridColumns: number
  collectionTileGap: string
  collectionTileMaxWidth: string
  collectionBaseTileWidth?: number // Optional: only used for absolute positioning layouts

  // Spacing
  spaceStandard: string
}

export interface PresetThresholds {
  mobile: { min: number; max: number }
  portrait: { min: number; max: number }
  square: { min: number; max: number }
  landscape: { min: number; max: number }
}

/**
 * Aspect ratio thresholds for each preset
 * Ratio = width / height
 * Mobile preset is for very narrow/tall screens (typical mobile portrait)
 */
export const PRESET_THRESHOLDS: PresetThresholds = {
  mobile: { min: 0, max: 0.6 },
  portrait: { min: 0.6, max: 0.9 },
  square: { min: 0.9, max: 1.2 },
  landscape: { min: 1.2, max: Infinity }
}

/**
 * Configuration values for each preset
 */
export const PRESETS: Record<PresetName, PresetConfig> = {
  mobile: {
    // Navigation - compact for mobile, positioned at top
    navHeight: '2.5rem',
    navFontSize: '1rem',
    navPadding: '0.5rem',
    navPosition: 'top',

    // Stage & Gallery - very vertical oriented
    stageImageScale: 0.75,
    collectionGap: '12vh',
    collectionImageWidth: '90vw',
    collectionImageHeight: '20vh',
    collectionTopPadding: '25vh',
    collectionStickyTop: '25vh',

    // Collection Grid - 1 column for mobile
    collectionGridColumns: 1,
    collectionTileGap: '2rem',
    collectionTileMaxWidth: '100%',

    // Spacing
    spaceStandard: '0.5rem'
  },

  portrait: {
    // Navigation - compact for tablet portrait, positioned at top
    navHeight: '3rem',
    navFontSize: '1.25rem',
    navPadding: '0.5rem',
    navPosition: 'bottom',

    // Stage & Gallery - vertical oriented
    stageImageScale: 0.7,
    collectionGap: '15vh',
    collectionImageWidth: '80vw',
    collectionImageHeight: '25vh',
    collectionTopPadding: '30vh',
    collectionStickyTop: '30vh',

    // Collection Grid - 2 columns for portrait
    collectionGridColumns: 2,
    collectionTileGap: '2.5rem',
    collectionTileMaxWidth: '100%',
    collectionBaseTileWidth: 280,

    // Spacing
    spaceStandard: '0.5rem'
  },

  square: {
    // Navigation - balanced, positioned at bottom
    navHeight: '3rem',
    navFontSize: '1.5rem',
    navPadding: '0.625rem',
    navPosition: 'bottom',

    // Stage & Gallery - balanced
    stageImageScale: 0.65,
    collectionGap: '20vh',
    collectionImageWidth: '70vw',
    collectionImageHeight: '30vh',
    collectionTopPadding: '35vh',
    collectionStickyTop: '35vh',

    // Collection Grid - 2 columns for square
    collectionGridColumns: 2,
    collectionTileGap: '3rem',
    collectionTileMaxWidth: '100%',
    collectionBaseTileWidth: 320,

    // Spacing
    spaceStandard: '0.625rem'
  },

  landscape: {
    // Navigation - expanded for wide screens, positioned at bottom
    navHeight: '3rem',
    navFontSize: '2rem',
    navPadding: '0.75rem',
    navPosition: 'bottom',

    // Stage & Gallery - horizontal oriented
    stageImageScale: 0.6,
    collectionGap: '25vh',
    collectionImageWidth: '60vw',
    collectionImageHeight: '35vh',
    collectionTopPadding: '40vh',
    collectionStickyTop: '40vh',

    // Collection Grid - 3 columns for landscape
    collectionGridColumns: 3,
    collectionTileGap: '3.5rem',
    collectionTileMaxWidth: '100%',
    collectionBaseTileWidth: 350,

    // Spacing
    spaceStandard: '0.75rem'
  }
}

/**
 * Debounce delay for resize events (milliseconds)
 */
export const RESIZE_DEBOUNCE_MS = 150

/**
 * CSS transition duration for preset changes (milliseconds)
 */
export const TRANSITION_DURATION_MS = 300
