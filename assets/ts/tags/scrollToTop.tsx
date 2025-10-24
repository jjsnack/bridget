/**
 * Scroll to Top Button Component
 * Shows when user scrolls down, returns to top on click
 */

import { type Component, createSignal, onMount, onCleanup, Show } from 'solid-js'

export const ScrollToTop: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false)

  const handleScroll = () => {
    // Show button when user scrolls down more than 300px
    setIsVisible(window.scrollY > 300)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })

    onCleanup(() => {
      window.removeEventListener('scroll', handleScroll)
    })
  })

  return (
    <Show when={isVisible()}>
      <button
        class="scroll-to-top"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
      >
        ↑
      </button>
    </Show>
  )
}
