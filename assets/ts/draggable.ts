import Draggabilly from 'draggabilly'

interface DraggableConfig {
  DRAG_Z_INDEX: number
  HOVER_SCALE: number
  WIDE_ASPECT_RATIO: number
  SQUARE_ASPECT_RATIO: number
}

interface DraggableElement extends HTMLElement {
  draggie?: Draggabilly
}

/**
 * Initialize drag functionality for c-projects items using Draggabilly
 */
export function initializeDraggable(config: DraggableConfig): void {
  const projects = document.querySelectorAll('.c-projects_item') as NodeListOf<DraggableElement>
  
  const isMultiColumn = (): boolean => {
    const aspectRatio = window.innerWidth / window.innerHeight
    return aspectRatio >= config.SQUARE_ASPECT_RATIO // Both wide and square layouts support dragging
  }

  projects.forEach((item) => {
    let hasDragged = false

    // Clean up existing Draggabilly instance if it exists
    if (item.draggie) {
      item.draggie.destroy()
      item.draggie = undefined
    }

    // Only initialize drag on multi-column layouts
    if (!isMultiColumn()) {
      return
    }

    // Initialize Draggabilly with no containment to allow free movement
    item.draggie = new Draggabilly(item, {
      containment: false // Allow dragging anywhere on screen
    })

    // Handle drag start
    item.draggie.on('dragStart', () => {
      item.classList.add('is-dragging')
      item.style.zIndex = config.DRAG_Z_INDEX.toString()
      
      // Scale up the item during drag
      const animElement = item.querySelector('.c-projects_anim') as HTMLElement
      if (animElement) {
        animElement.style.transform = `scale(${config.HOVER_SCALE})`
      }
      
      hasDragged = true
    })

    // Handle drag end
    item.draggie.on('dragEnd', () => {
      item.classList.remove('is-dragging')
      item.style.zIndex = ''
      
      // Reset scale
      const animElement = item.querySelector('.c-projects_anim') as HTMLElement
      if (animElement) {
        animElement.style.transform = ''
      }

      // Reset hasDragged flag after a short delay to prevent click events
      setTimeout(() => {
        hasDragged = false
      }, 10)
    })

    // Handle drag move - allow free movement anywhere on screen
    item.draggie.on('dragMove', () => {
      // No boundary constraints - allow items to be placed anywhere
      // Items can be dragged beyond viewport if needed
    })

    // Prevent navigation when dragging
    const projectLink = item.querySelector('.c-projects_link') as HTMLAnchorElement
    if (projectLink) {
      projectLink.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault()
          e.stopPropagation()
        }
      })
    }
  })
}

/**
 * Destroy all drag instances (useful for cleanup)
 */
export function destroyDraggable(): void {
  const projects = document.querySelectorAll('.c-projects_item') as NodeListOf<DraggableElement>
  
  projects.forEach((item) => {
    if (item.draggie) {
      item.draggie.destroy()
      item.draggie = undefined
    }
    
    // Clean up classes and styles
    item.classList.remove('is-dragging')
    item.style.zIndex = ''
    
    const animElement = item.querySelector('.c-projects_anim') as HTMLElement
    if (animElement) {
      animElement.style.transform = ''
    }
  })
}

/**
 * Reinitialize drag functionality (useful for layout changes)
 */
export function reinitializeDraggable(config: DraggableConfig): void {
  destroyDraggable()
  initializeDraggable(config)
}