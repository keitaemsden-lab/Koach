import type { RefObject } from 'react'

export function useSVGCoords(svgRef: RefObject<SVGSVGElement | null>) {
  return (clientX: number, clientY: number): { x: number; y: number } => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (680 / rect.width),
      y: (clientY - rect.top)  * (1050 / rect.height),
    }
  }
}
