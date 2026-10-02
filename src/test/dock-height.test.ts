import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

// Selecting a player must not resize the phone pitch: the dock reserves the height of the
// tallest card (the player card, 94 px measured at 375 wide), so the pitch never rescales.
describe('phone dock', () => {
  it('reserves at least the player card height', () => {
    const css = readFileSync('src/styles/index.css', 'utf8')
    const rule = css.match(/\.dock \{ display: flex[^}]*\}/)?.[0] ?? ''
    const min = Number(rule.match(/min-height: (\d+)px/)?.[1] ?? 0)
    expect(min).toBeGreaterThanOrEqual(94)
  })
})
