import { useCallback } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { midpoint } from '@/utils/arrowPaths'
import { straightArrowPath, curvedArrowPath } from '@/utils/arrowPaths'
import type { Point } from '@/store/types'

interface DrawingOverlayProps {
  svgRef: React.RefObject<SVGSVGElement | null>
}

export default function DrawingOverlay({ svgRef }: DrawingOverlayProps) {
  const mode         = useBoardStore((s) => s.mode)
  const arrowType    = useBoardStore((s) => s.arrowType)
  const arrowStyle   = useBoardStore((s) => s.arrowStyle)
  const drawingState = useBoardStore((s) => s.drawingState)
  const homeColour   = useBoardStore((s) => s.homeColour)
  const addArrow        = useBoardStore((s) => s.addArrow)
  const setDrawingState = useBoardStore((s) => s.setDrawingState)
  const selectArrow     = useBoardStore((s) => s.selectArrow)

  const toSVG = useCallback((clientX: number, clientY: number): Point => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (680 / rect.width),
      y: (clientY - rect.top)  * (1050 / rect.height),
    }
  }, [svgRef])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drawingState) return
    setDrawingState({ ...drawingState, currentPointer: toSVG(e.clientX, e.clientY) })
  }, [drawingState, setDrawingState, toSVG])

  const onClick = useCallback((e: React.MouseEvent) => {
    if (mode !== 'draw-arrow') return
    const pt = toSVG(e.clientX, e.clientY)

    if (!drawingState) {
      setDrawingState({ phase: 'start-placed', start: pt, currentPointer: pt })
      return
    }

    // Second click — commit arrow
    const { start } = drawingState
    const ctrl = arrowStyle === 'curved' ? midpoint(start, pt) : undefined
    addArrow({
      type: arrowType,
      style: arrowStyle,
      start,
      end: pt,
      control: ctrl,
      teamColour: homeColour,
    })
    if (arrowStyle === 'curved') {
      const arrows = useBoardStore.getState().arrows
      const newId = arrows[arrows.length - 1]?.id
      if (newId) selectArrow(newId)
    }
    setDrawingState(null)
  }, [mode, drawingState, arrowType, arrowStyle, homeColour, addArrow, setDrawingState, selectArrow, toSVG])

  if (mode !== 'draw-arrow') return null

  // Preview arrow
  const previewPath = drawingState
    ? arrowStyle === 'curved' && drawingState.control
      ? curvedArrowPath(drawingState.start, drawingState.currentPointer, drawingState.control)
      : straightArrowPath(drawingState.start, drawingState.currentPointer)
    : null

  return (
    <g>
      {/* Transparent capture rect */}
      <rect
        x={0} y={0} width={680} height={1050}
        fill="transparent"
        style={{ cursor: 'crosshair', pointerEvents: 'all' }}
        onClick={onClick}
        onPointerMove={onPointerMove}
      />

      {/* Start dot */}
      {drawingState && (
        <circle cx={drawingState.start.x} cy={drawingState.start.y} r={4}
          fill="white" opacity={0.8} style={{ pointerEvents: 'none' }} />
      )}

      {/* Preview line */}
      {previewPath && (
        <path
          d={previewPath}
          stroke="white"
          strokeWidth={2}
          strokeDasharray="6 3"
          fill="none"
          opacity={0.6}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  )
}
