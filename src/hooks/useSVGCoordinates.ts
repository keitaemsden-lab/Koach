import { useCallback, useState, useEffect } from 'react'
import type { RefObject } from 'react'
import { useBoardStore } from '@/store/boardStore'
import type { Point } from '@/store/types'

export function useSVGCoordinates(svgRef: RefObject<SVGSVGElement | null>) {
  const pitchOrientation = useBoardStore((s) => s.pitchOrientation)
  const isLandscape = pitchOrientation === 'landscape'
  const VB_W = isLandscape ? 1050 : 680
  const VB_H = isLandscape ? 680 : 1050

  const [scaleX, setScaleX] = useState(1)
  const [scaleY, setScaleY] = useState(1)

  useEffect(() => {
    function updateScale() {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      setScaleX(VB_W / rect.width)
      setScaleY(VB_H / rect.height)
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [svgRef, VB_W, VB_H])

  const toSVG = useCallback((clientX: number, clientY: number): Point => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (VB_W / rect.width),
      y: (clientY - rect.top)  * (VB_H / rect.height),
    }
  }, [svgRef, VB_W, VB_H])

  return { VB_W, VB_H, scaleX, scaleY, toSVG }
}
