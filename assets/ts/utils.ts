import { type gsap } from 'gsap'

/**
 * types
 */

export type Vector = 'prev' | 'next' | 'none'

/**
 * utils
 */

export function increment(num: number, length: number): number {
  return (num + 1) % length
}

export function decrement(num: number, length: number): number {
  return (num + length - 1) % length
}

export function expand(num: number): string {
  return ('0000' + num.toString()).slice(-4)
}

export async function loadGsap(): Promise<typeof gsap> {
  const g = await import('gsap')
  // ponytail: reduced-motion handled once at the single GSAP load point —
  // a huge global timeScale collapses every core-gallery tween to one frame,
  // instead of back-porting a matchMedia guard to each tween in
  // stageAnimations/galleryTransitions. Newer modules that already guard
  // (grid, post) are unaffected — they pass duration 0 regardless.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    g.gsap.globalTimeline.timeScale(1000)
  }
  return g.gsap
}

export function getThresholdSessionIndex(): number {
  const s = sessionStorage.getItem('thresholdsIndex')
  if (s === null) return 2
  return parseInt(s)
}

export function isMobile(): boolean {
  const ua = window.navigator.userAgent.toLowerCase()
  const hasTouchInput = 'ontouchstart' in window || window.navigator.maxTouchPoints > 0
  const hasTouchLayout =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  const isMobileUA = /android|iphone|ipad|ipod|mobile/.test(ua)
  const isWindowsDesktop = /windows nt/.test(ua)
  return isMobileUA || (hasTouchInput && hasTouchLayout && !isWindowsDesktop)
}

export function removeDuplicates<T>(arr: T[]): T[] {
  if (arr.length < 2) return arr // optimization
  return [...new Set(arr)]
}
