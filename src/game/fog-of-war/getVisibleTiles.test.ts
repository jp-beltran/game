import { describe, it, expect } from 'vitest'
import { getVisibleTiles } from './getVisibleTiles'

describe('getVisibleTiles', () => {
  it('should always show the player tile', () => {
    const visible = getVisibleTiles({
      playerCoordinate: { q: 5, r: 5 },
      visionRange: 5,
    })
    
    expect(visible.has('5:5')).toBe(true)
  })

  it('omnidirectional vision reveals all tiles within radius', () => {
    const visible = getVisibleTiles({
      playerCoordinate: { q: 5, r: 5 },
      visionRange: 2,
    })
    
    // Front, back, left, right should all be visible up to distance 2
    expect(visible.has('5:4')).toBe(true)
    expect(visible.has('5:6')).toBe(true)
    expect(visible.has('6:5')).toBe(true)
    expect(visible.has('4:5')).toBe(true)
    
    // Distance 3 should be hidden
    expect(visible.has('5:2')).toBe(false)
    expect(visible.has('5:8')).toBe(false)
  })

  it('tiles outside vision range are hidden', () => {
    const visible = getVisibleTiles({
      playerCoordinate: { q: 5, r: 5 },
      visionRange: 3,
    })
    
    expect(visible.has('5:1')).toBe(false) // distance 4
  })
})
