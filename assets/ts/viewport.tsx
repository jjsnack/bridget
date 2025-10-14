import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  type Accessor,
  type JSX
} from 'solid-js'
import invariant from 'tiny-invariant'

import {
  PRESETS,
  PRESET_THRESHOLDS,
  RESIZE_DEBOUNCE_MS,
  type PresetConfig,
  type PresetName
} from './presets'

/**
 * Viewport Context Type
 */
export type ViewportContextType = readonly [
  Accessor<PresetName>,
  Accessor<PresetConfig>,
  Accessor<number>
]

const ViewportContext = createContext<ViewportContextType>()

/**
 * Calculate aspect ratio from viewport dimensions
 */
function calculateAspectRatio(): number {
  return window.innerWidth / window.innerHeight
}

/**
 * Determine preset based on aspect ratio
 */
function getPresetFromRatio(ratio: number): PresetName {
  if (ratio <= PRESET_THRESHOLDS.portrait.max) {
    return 'portrait'
  } else if (ratio <= PRESET_THRESHOLDS.square.max) {
    return 'square'
  } else {
    return 'landscape'
  }
}

/**
 * Apply preset configuration to CSS custom properties
 */
function applyCSSVariables(config: PresetConfig): void {
  const root = document.documentElement

  // Navigation
  root.style.setProperty('--nav-height', config.navHeight)
  root.style.setProperty('--nav-font-size', config.navFontSize)
  root.style.setProperty('--nav-padding', config.navPadding)

  // Stage & Gallery
  root.style.setProperty('--stage-image-scale', config.stageImageScale.toString())
  root.style.setProperty('--collection-gap', config.collectionGap)
  root.style.setProperty('--collection-image-width', config.collectionImageWidth)
  root.style.setProperty('--collection-image-height', config.collectionImageHeight)
  root.style.setProperty('--collection-top-padding', config.collectionTopPadding)
  root.style.setProperty('--collection-sticky-top', config.collectionStickyTop)

  // Spacing
  root.style.setProperty('--space-standard', config.spaceStandard)
}

/**
 * Debounce utility
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Viewport Provider Component
 */
export function ViewportProvider(props: { children?: JSX.Element }): JSX.Element {
  // Initialize with current viewport
  const initialRatio = calculateAspectRatio()
  const initialPreset = getPresetFromRatio(initialRatio)

  const [preset, setPreset] = createSignal<PresetName>(initialPreset)
  const [config, setConfig] = createSignal<PresetConfig>(PRESETS[initialPreset])
  const [ratio, setRatio] = createSignal<number>(initialRatio)

  // Update preset and config when ratio changes
  const updateViewport = (): void => {
    const newRatio = calculateAspectRatio()
    const newPreset = getPresetFromRatio(newRatio)

    setRatio(newRatio)

    // Only update if preset actually changed
    if (newPreset !== preset()) {
      setPreset(newPreset)
      setConfig(PRESETS[newPreset])
    }
  }

  // Debounced resize handler
  const debouncedUpdate = debounce(updateViewport, RESIZE_DEBOUNCE_MS)

  // Setup resize listener
  onMount(() => {
    // Apply initial CSS variables
    applyCSSVariables(config())

    // Add resize listener
    window.addEventListener('resize', debouncedUpdate)
  })

  // Cleanup resize listener
  onCleanup(() => {
    window.removeEventListener('resize', debouncedUpdate)
  })

  // Apply CSS variables when config changes
  createEffect(() => {
    applyCSSVariables(config())
  })

  const contextValue: ViewportContextType = [preset, config, ratio] as const

  return <ViewportContext.Provider value={contextValue}>{props.children}</ViewportContext.Provider>
}

/**
 * Hook to use viewport context
 */
export function useViewport(): ViewportContextType {
  const context = useContext(ViewportContext)
  invariant(context, 'useViewport must be used within ViewportProvider')
  return context
}
