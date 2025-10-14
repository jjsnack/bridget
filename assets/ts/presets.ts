/**
 * Viewport Aspect-Ratio Preset Configuration
 *
 * This file defines preset configurations for different viewport aspect ratios.
 * All dynamic layout values should be defined here for centralized management.
 */

export type PresetName = 'portrait' | 'square' | 'landscape'

export interface PresetConfig {
  // Navigation
  navHeight: string
  navFontSize: string
  navPadding: string

  // Stage & Gallery
  stageImageScale: number
  collectionGap: string
  collectionImageWidth: string
  collectionImageHeight: string
  collectionTopPadding: string
  collectionStickyTop: string

  // Spacing
  spaceStandard: string
}

export interface PresetThresholds {
  portrait: { min: number; max: number }
  square: { min: number; max: number }
  landscape: { min: number; max: number }
}

/**
 * Aspect ratio thresholds for each preset
 * Ratio = width / height
 */
export const PRESET_THRESHOLDS: PresetThresholds = {
  portrait: { min: 0, max: 0.8 },
  square: { min: 0.8, max: 1.2 },
  landscape: { min: 1.2, max: Infinity }
}

/**
 * Configuration values for each preset
 */
export const PRESETS: Record<PresetName, PresetConfig> = {
  portrait: {
    // Navigation - compact for mobile portrait
    navHeight: '3rem',
    navFontSize: '1.5rem',
    navPadding: '0.5rem',

    // Stage & Gallery - vertical oriented
    stageImageScale: 0.7,
    collectionGap: '15vh',
    collectionImageWidth: '80vw',
    collectionImageHeight: '25vh',
    collectionTopPadding: '30vh',
    collectionStickyTop: '30vh',

    // Spacing
    spaceStandard: '0.5rem'
  },

  square: {
    // Navigation - balanced
    navHeight: '3rem',
    navFontSize: '2rem',
    navPadding: '0.625rem',

    // Stage & Gallery - balanced
    stageImageScale: 0.65,
    collectionGap: '20vh',
    collectionImageWidth: '70vw',
    collectionImageHeight: '30vh',
    collectionTopPadding: '35vh',
    collectionStickyTop: '35vh',

    // Spacing
    spaceStandard: '0.625rem'
  },

  landscape: {
    // Navigation - expanded for wide screens
    navHeight: '3rem',
    navFontSize: '2rem',
    navPadding: '0.75rem',

    // Stage & Gallery - horizontal oriented
    stageImageScale: 0.6,
    collectionGap: '25vh',
    collectionImageWidth: '60vw',
    collectionImageHeight: '35vh',
    collectionTopPadding: '40vh',
    collectionStickyTop: '40vh',

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
