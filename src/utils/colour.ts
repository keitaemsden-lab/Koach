// src/utils/colour.ts

/**
 * Lighten a hex colour by blending it toward white.
 * Algorithm: each RGB channel = channel + (255 - channel) * amount
 *
 * @param hex    — 6-digit hex string, e.g. "#2563eb"
 * @param amount — 0 to 1 float (0 = original colour, 1 = white)
 * @returns      — 6-digit hex string of the lightened colour
 *
 * Example: lightenColour("#2563eb", 0.25) → approximately "#517ef0"
 */
export function lightenColour(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)

  const nr = Math.round(r + (255 - r) * amount)
  const ng = Math.round(g + (255 - g) * amount)
  const nb = Math.round(b + (255 - b) * amount)

  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}
