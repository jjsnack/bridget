import { initializeDraggable, destroyDraggable, reinitializeDraggable } from './draggable'
import { initializeHoverEffects, destroyHoverEffects } from './hoverEffects'

interface LMChabotConfig {
  // Layout breakpoints
  WIDE_LAYOUT_MIN: number
  MEDIUM_LAYOUT_MIN: number
  MOBILE_MAX: number
  
  // Aspect ratio thresholds
  WIDE_ASPECT_RATIO: number // Wide screens (>= this ratio use alternating 3/2 columns)
  SQUARE_ASPECT_RATIO: number // Square screens (use 2 columns)
  // Tall screens (< SQUARE_ASPECT_RATIO use 1 column)

  // Drag parameters
  DRAG_Z_INDEX: number
  HOVER_SCALE: number
  
  // Animation parameters
  TITLE_CYCLE_SPEED: number
  TRANSITION_SPEED: string
}

const DEFAULT_CONFIG: LMChabotConfig = {
  WIDE_LAYOUT_MIN: 1000,
  MEDIUM_LAYOUT_MIN: 700,
  MOBILE_MAX: 699,
  WIDE_ASPECT_RATIO: 1.5, // 3:2 aspect ratio or wider = wide layout
  SQUARE_ASPECT_RATIO: 0.9, // 0.9:1 aspect ratio or wider = square layout
  DRAG_Z_INDEX: 1000,
  HOVER_SCALE: 1.02,
  TITLE_CYCLE_SPEED: 500,
  TRANSITION_SPEED: '0.3s'
}

class LMChabotLayout {
  private config: LMChabotConfig
  private hoverIntervals: Map<HTMLElement, number> = new Map()
  private isInitialized = false

  constructor(config: Partial<LMChabotConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Initialize the complete lmchabot layout system
   */
  public initialize(): void {
    if (this.isInitialized) {
      this.destroy()
    }

    const projects = document.querySelectorAll('.c-projects_item')
    if (projects.length === 0) {
      console.warn('No .c-projects_item elements found')
      return
    }

    // Apply layout classes based on current aspect ratio
    this.applyLayoutClasses()

    // Initialize drag functionality for multi-column layouts (wide and square)
    const layoutType = this.getCurrentLayoutType()
    if (layoutType === 'wide' || layoutType === 'square') {
      initializeDraggable(this.config)
    }

    // Initialize hover effects and image transitions
    this.hoverIntervals = initializeHoverEffects(this.config)

    // Set up responsive behavior
    this.setupResponsiveHandlers()

    this.isInitialized = true

    console.log('LM Chabot layout initialized with', projects.length, 'projects, layout:', layoutType)
  }

  /**
   * Destroy all layout functionality
   */
  public destroy(): void {
    if (!this.isInitialized) return

    // Destroy drag functionality
    destroyDraggable()

    // Destroy hover effects
    destroyHoverEffects(this.hoverIntervals)
    this.hoverIntervals.clear()

    // Remove event listeners
    this.removeResponsiveHandlers()

    // Remove layout classes
    const body = document.body
    body.classList.remove('layout-wide', 'layout-square', 'layout-tall')

    this.isInitialized = false

    console.log('LM Chabot layout destroyed')
  }

  /**
   * Reinitialize the layout (useful for dynamic content changes)
   */
  public reinitialize(): void {
    this.destroy()
    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      this.initialize()
    }, 50)
  }

  /**
   * Check if the layout is currently initialized
   */
  public get initialized(): boolean {
    return this.isInitialized
  }

  /**
   * Get current configuration
   */
  public get configuration(): LMChabotConfig {
    return { ...this.config }
  }

  /**
   * Update configuration and reinitialize if needed
   */
  public updateConfig(newConfig: Partial<LMChabotConfig>): void {
    this.config = { ...this.config, ...newConfig }
    if (this.isInitialized) {
      this.reinitialize()
    }
  }

  /**
   * Setup responsive handlers for layout changes
   */
  private setupResponsiveHandlers(): void {
    this.handleResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.handleResize)
  }

  /**
   * Remove responsive handlers
   */
  private removeResponsiveHandlers(): void {
    window.removeEventListener('resize', this.handleResize)
  }

  /**
   * Handle window resize with debouncing
   */
  private resizeTimeout: number | undefined
  private handleResize(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }

    this.resizeTimeout = window.setTimeout(() => {
      if (this.isInitialized) {
        console.log('Reinitializing layout due to resize')
        this.reinitialize()
      }
    }, 250)
  }

  /**
   * Get current layout type based on viewport aspect ratio and size
   */
  public getCurrentLayoutType(): 'wide' | 'square' | 'tall' {
    const width = window.innerWidth
    const height = window.innerHeight
    const aspectRatio = width / height
    
    // For very small screens, always use tall layout
    if (width <= this.config.MOBILE_MAX) {
      return 'tall'
    }
    
    // Use aspect ratio to determine layout
    if (aspectRatio >= this.config.WIDE_ASPECT_RATIO) {
      return 'wide' // Wide screens: alternating 3/2 column layout
    } else if (aspectRatio >= this.config.SQUARE_ASPECT_RATIO) {
      return 'square' // Square-ish screens: 2 column layout
    } else {
      return 'tall' // Tall screens: 1 column layout
    }
  }

  /**
   * Apply layout classes to body based on current layout type
   */
  public applyLayoutClasses(): void {
    const layoutType = this.getCurrentLayoutType()
    const body = document.body
    
    // Remove existing layout classes
    body.classList.remove('layout-wide', 'layout-square', 'layout-tall')
    
    // Add current layout class
    body.classList.add(`layout-${layoutType}`)
    
    console.log(`Applied layout class: layout-${layoutType} (aspect ratio: ${(window.innerWidth / window.innerHeight).toFixed(2)})`)
  }

  /**
   * Manually trigger hover effects (useful for testing)
   */
  public triggerHover(itemIndex: number): void {
    const projects = document.querySelectorAll('.c-projects_item')
    const item = projects[itemIndex] as HTMLElement
    
    if (item) {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true })
      item.dispatchEvent(enterEvent)
    }
  }

  /**
   * Manually stop hover effects (useful for testing)
   */
  public stopHover(itemIndex: number): void {
    const projects = document.querySelectorAll('.c-projects_item')
    const item = projects[itemIndex] as HTMLElement
    
    if (item) {
      const leaveEvent = new MouseEvent('mouseleave', { bubbles: true })
      item.dispatchEvent(leaveEvent)
    }
  }
}

// Export singleton instance
export const lmchabotLayout = new LMChabotLayout()

// Export class for custom instances
export { LMChabotLayout }

// Export config interface for typing
export type { LMChabotConfig }