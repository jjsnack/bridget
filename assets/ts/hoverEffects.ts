interface HoverConfig {
  TITLE_CYCLE_SPEED: number
  WIDE_LAYOUT_MIN: number
}

interface TitleElements {
  top: HTMLElement | null
  bottom: HTMLElement | null
  left: HTMLElement | null
  right: HTMLElement | null
}

/**
 * Initialize hover effects for c-projects items
 * Includes image cycling and title rotation animations
 */
export function initializeHoverEffects(config: HoverConfig): Map<HTMLElement, number> {
  const projects = document.querySelectorAll('.c-projects_item') as NodeListOf<HTMLElement>
  const cycleIntervals = new Map<HTMLElement, number>()
  
  const isWideScreen = (): boolean => window.innerWidth >= config.WIDE_LAYOUT_MIN

  projects.forEach((item) => {
    const img = item.querySelector('.collection-photo') as HTMLImageElement
    const hoverContainer = item.querySelector('.c-projects_hover') as HTMLElement
    const hoverImages = item.querySelectorAll('.c-projects_hover_img') as NodeListOf<HTMLElement>
    const imagesData = img?.dataset.images
    
    // Get title elements for rotation
    function getTitleElements(): TitleElements {
      return {
        top: item.querySelector('.c-projects_title_label.-top'),
        bottom: item.querySelector('.c-projects_title_label.-bottom'),
        left: item.querySelector('.c-projects_title_label.-left'),
        right: item.querySelector('.c-projects_title_label.-right')
      }
    }

    if (!img || !imagesData) return

    const imageUrls = imagesData.split(',').map(url => url.trim()).filter(url => url)
    let currentIndex = 0

    // Mouse enter - start cycling
    item.addEventListener('mouseenter', () => {
      if (imageUrls.length <= 1) return

      // Start image and title cycling
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % imageUrls.length
        
        // Update main image
        img.src = imageUrls[currentIndex]
        
        // Update hover images background
        if (hoverImages[currentIndex]) {
          // Hide all hover images first
          hoverImages.forEach((hoverImg, idx) => {
            if (hoverImg instanceof HTMLElement) {
              hoverImg.style.opacity = idx === currentIndex ? '1' : '0'
            }
          })
        }
        
        // Handle title rotation on wide screens
        if (isWideScreen()) {
          const titleElements = getTitleElements()
          const titleOrder: (keyof TitleElements)[] = ['bottom', 'right', 'top', 'left']
          const activeTitle = titleOrder[currentIndex % titleOrder.length]
          
          // Hide all titles
          Object.values(titleElements).forEach(el => {
            if (el) {
              el.style.visibility = 'hidden'
              el.style.animation = 'none'
            }
          })
          
          // Show active title with animation
          if (titleElements[activeTitle]) {
            titleElements[activeTitle]!.style.visibility = 'visible'
            // Trigger the visibility animation that matches lmchabot timing
            const animationDelay = currentIndex * 0.5 // Stagger animations
            titleElements[activeTitle]!.style.animation = `visibility 2s ${animationDelay}s infinite linear`
          }
        }
      }, config.TITLE_CYCLE_SPEED)
      
      cycleIntervals.set(item, interval)
    })

    // Mouse leave - stop cycling and reset
    item.addEventListener('mouseleave', () => {
      const interval = cycleIntervals.get(item)
      if (interval) {
        clearInterval(interval)
        cycleIntervals.delete(item)
      }

      // Reset to first image
      currentIndex = 0
      img.src = imageUrls[0]
      
      // Reset hover images
      hoverImages.forEach((hoverImg) => {
        if (hoverImg instanceof HTMLElement) {
          hoverImg.style.opacity = '0'
        }
      })
      
      // Reset titles on wide screens
      if (isWideScreen()) {
        const titleElements = getTitleElements()
        Object.values(titleElements).forEach(el => {
          if (el) {
            el.style.visibility = 'hidden'
            el.style.animation = 'none'
          }
        })
      }
    })

    // Set up hover image backgrounds
    hoverImages.forEach((hoverImg, idx) => {
      if (hoverImg instanceof HTMLElement && imageUrls[idx]) {
        const bgImageValue = hoverImg.dataset.style
        if (bgImageValue) {
          hoverImg.style.backgroundImage = bgImageValue.replace(/^background-image:\s*/, '')
        }
      }
    })
  })

  return cycleIntervals
}

/**
 * Clean up hover effects
 */
export function destroyHoverEffects(cycleIntervals: Map<HTMLElement, number>): void {
  // Clear all intervals
  cycleIntervals.forEach((interval) => {
    clearInterval(interval)
  })
  cycleIntervals.clear()
  
  // Reset all images and titles
  const projects = document.querySelectorAll('.c-projects_item') as NodeListOf<HTMLElement>
  
  projects.forEach((item) => {
    const img = item.querySelector('.collection-photo') as HTMLImageElement
    const hoverImages = item.querySelectorAll('.c-projects_hover_img') as NodeListOf<HTMLElement>
    const imagesData = img?.dataset.images
    
    if (img && imagesData) {
      const imageUrls = imagesData.split(',').map(url => url.trim()).filter(url => url)
      if (imageUrls.length > 0) {
        img.src = imageUrls[0] // Reset to first image
      }
    }
    
    // Reset hover images
    hoverImages.forEach((hoverImg) => {
      if (hoverImg instanceof HTMLElement) {
        hoverImg.style.opacity = '0'
      }
    })
    
    // Reset titles
    const titleLabels = item.querySelectorAll('.c-projects_title_label') as NodeListOf<HTMLElement>
    titleLabels.forEach(label => {
      label.style.visibility = 'hidden'
      label.style.animation = 'none'
    })
  })
}

/**
 * Initialize title rotation system specifically (called separately if needed)
 */
export function initializeTitleRotation(config: HoverConfig): void {
  const projects = document.querySelectorAll('.c-projects_item') as NodeListOf<HTMLElement>
  const isWideScreen = (): boolean => window.innerWidth >= config.WIDE_LAYOUT_MIN
  
  if (!isWideScreen()) return

  projects.forEach((item) => {
    const titleLabels = item.querySelectorAll('.c-projects_title_label') as NodeListOf<HTMLElement>
    
    // Set up the staggered animation timing that matches lmchabot
    item.addEventListener('mouseenter', () => {
      titleLabels.forEach((label, index) => {
        const delay = index * 0.5 // 0s, 0.5s, 1s, 1.5s delays
        label.style.animation = `visibility 2s ${delay}s infinite linear`
      })
    })
    
    item.addEventListener('mouseleave', () => {
      titleLabels.forEach((label) => {
        label.style.animation = 'none'
        label.style.visibility = 'hidden'
      })
    })
  })
}