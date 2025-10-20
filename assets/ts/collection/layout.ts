/**
 * Layout utilities for pseudorandom tile positioning
 */

import type { CollectionData } from './types'

export interface TilePosition {
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}

export interface TileBounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Seeded random number generator (Mulberry32)
 * Produces consistent random numbers for a given seed
 */
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /**
   * Generate random integer between min (inclusive) and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  /**
   * Generate random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }
}

/**
 * Calculate tile size category based on image aspect ratio
 * Returns multiplier for base tile size
 */
export function getTileSizeMultiplier(
  width: number,
  height: number,
  rng: SeededRandom
): number {
  const aspectRatio = width / height

  // Portrait images (taller than wide) - generally smaller to save vertical space
  if (aspectRatio < 0.8) {
    const rand = rng.next()
    if (rand > 0.7) return 1.3
    if (rand > 0.4) return 1.1
    return 0.95
  }

  // Square-ish images - medium to large sizes
  if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
    const rand = rng.next()
    if (rand > 0.6) return 1.4
    if (rand > 0.3) return 1.2
    return 1.0
  }

  // Landscape images (wider than tall) - can be larger since they take less vertical space
  const rand = rng.next()
  if (rand > 0.6) return 1.5
  if (rand > 0.3) return 1.3
  return 1.1
}

/**
 * Check if two rectangles overlap with a buffer zone
 */
export function checkCollision(
  bounds1: TileBounds,
  bounds2: TileBounds,
  buffer: number
): boolean {
  return !(
    bounds1.x + bounds1.width + buffer < bounds2.x ||
    bounds1.x > bounds2.x + bounds2.width + buffer ||
    bounds1.y + bounds1.height + buffer < bounds2.y ||
    bounds1.y > bounds2.y + bounds2.height + buffer
  )
}

/**
 * Try to find a non-colliding position for a tile using a top-biased approach
 */
export function findNonCollidingPosition(
  tileWidth: number,
  tileHeight: number,
  existingPositions: TilePosition[],
  containerWidth: number,
  containerHeight: number,
  rng: SeededRandom,
  maxAttempts = 100,
  baseTileWidth = 400 // Base tile width for scaling spacing
): { x: number; y: number } | null {
  const buffer = 80 // Adequate spacing between tiles
  const edgeMargin = 50

  // Start from the top and work down in rows
  // Scale row height based on tile size - smaller tiles get tighter spacing
  // Reduced base height for tighter vertical spacing in portrait/square
  const scaleFactor = baseTileWidth / 400 // Normalize to 400px base
  const approximateRowHeight = Math.max(250, 300 * scaleFactor) // Min 250px, reduced base
  const maxRows = Math.ceil(containerHeight / approximateRowHeight)

  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    // More attempts per row for better placement
    for (let attempt = 0; attempt < Math.ceil(maxAttempts / maxRows); attempt++) {
      // Y position within this row (with subtle random offset for natural staggering)
      const rowBaseY = edgeMargin + rowIndex * approximateRowHeight
      const yOffset = rng.nextFloat(-40, 40) // Subtle vertical stagger
      const y = Math.max(edgeMargin, Math.min(rowBaseY + yOffset, containerHeight - tileHeight - edgeMargin))

      // X position (random across the width with subtle stagger)
      const maxX = containerWidth - tileWidth - edgeMargin
      if (maxX < edgeMargin) continue // Skip if tile doesn't fit

      const xOffset = rng.nextFloat(-30, 30) // Subtle horizontal stagger
      const baseX = edgeMargin + (maxX - edgeMargin) * rng.next()
      const x = Math.max(edgeMargin, Math.min(baseX + xOffset, maxX))

      const newBounds: TileBounds = { x, y, width: tileWidth, height: tileHeight }

      // Check collision with all existing tiles
      let hasCollision = false
      for (const existing of existingPositions) {
        if (checkCollision(newBounds, existing, buffer)) {
          hasCollision = true
          break
        }
      }

      if (!hasCollision) {
        return { x, y }
      }
    }
  }

  return null // Failed to find non-colliding position
}

/**
 * Calculate pseudorandom positions for all tiles
 */
export function calculateTilePositions(
  collections: CollectionData[],
  containerWidth: number,
  containerHeight: number,
  baseTileWidth: number
): TilePosition[] {
  // Use a fixed seed for consistent layout
  const rng = new SeededRandom(12345)
  const positions: TilePosition[] = []

  for (const collection of collections) {
    const aspectRatio = collection.heroWidth / collection.heroHeight
    const sizeMultiplier = getTileSizeMultiplier(
      collection.heroWidth,
      collection.heroHeight,
      rng
    )

    // Calculate tile dimensions maintaining aspect ratio
    const tileWidth = baseTileWidth * sizeMultiplier
    const tileHeight = tileWidth / aspectRatio

    // Find non-colliding position
    const position = findNonCollidingPosition(
      tileWidth,
      tileHeight,
      positions,
      containerWidth,
      containerHeight,
      rng,
      100, // maxAttempts
      baseTileWidth // Pass base tile width for spacing calculation
    )

    if (position) {
      positions.push({
        x: position.x,
        y: position.y,
        width: tileWidth,
        height: tileHeight,
        zIndex: 1,
      })
    } else {
      // Fallback: place at a staggered grid position
      const fallbackY = positions.length * 400
      positions.push({
        x: 100,
        y: fallbackY,
        width: tileWidth,
        height: tileHeight,
        zIndex: 1,
      })
    }
  }

  return positions
}
