import { useCallback, useRef, useState } from 'react'
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
  const arrows          = useBoardStore((s) => s.arrows)
  const updateArrowControl = useBoardStore((s) => s.updateArrowControl)

  const draggingArrowId = useRef<string | null>(null)
  const [pendingCurveAdjustId, setPendingCurveAdjustId] = useState<string | null>(null)

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
      if (newId) {
        selectArrow(newId)
        setPendingCurveAdjustId(newId)
      }
    }
    setDrawingState(null)
  }, [mode, drawingState, arrowType, arrowStyle, homeColour, addArrow, setDrawingState, selectArrow, toSVG])

  const onControlPointerDown = useCallback((e: React.PointerEvent, arrowId: string) => {
    e.stopPropagation()
    draggingArrowId.current = arrowId
    ;(e.currentTarget as SVGElement).setPointerCapture(e.pointerId)
  }, [])

  const onControlPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingArrowId.current) return
    updateArrowControl(draggingArrowId.current, toSVG(e.clientX, e.clientY))
  }, [updateArrowControl, toSVG])

  const onControlPointerUp = useCallback(() => {
    draggingArrowId.current = null
    setPendingCurveAdjustId(null)
  }, [])

  if (mode !== 'draw-arrow') return null

  // Preview arrow
  const previewPath = drawingState
    ? arrowStyle === 'curved' && drawingState.control
      ? curvedArrowPath(drawingState.start, drawingState.currentPointer, drawingState.control)
      : straightArrowPath(drawingState.start, drawingState.currentPointer)
    : null

  const pendingCurvedArrow = pendingCurveAdjustId
    ? arrows.find((arrow) => arrow.id === pendingCurveAdjustId && arrow.style === 'curved')
    : null

  const pendingControlPoint = pendingCurvedArrow
    ? (pendingCurvedArrow.control ?? midpoint(pendingCurvedArrow.start, pendingCurvedArrow.end))
    : null

  return (
    <g>
      {/* Transparent capture rect */}
      <rect
        x={0} y={0} width={680} height={1050}
        fill="transparent"
        style={{ cursor: 'crosshair', pointerEvents: 'all' }}
        onPointerUp={(e) => {
          if (!e.isPrimary) return
          onClick(e as unknown as React.MouseEvent)
        }}
        onPointerMove={onPointerMove}
      />

      {/* Start dot */}
      {drawingState && (
        <>
          <circle cx={drawingState.start.x} cy={drawingState.start.y} r={8} fill="white" opacity={0.15} style={{ pointerEvents: 'none' }} />
          <circle cx={drawingState.start.x} cy={drawingState.start.y} r={4} fill="white" opacity={0.8} style={{ pointerEvents: 'none' }} />
        </>
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

      {pendingControlPoint && pendingCurvedArrow && (
        <circle
          cx={pendingControlPoint.x}
          cy={pendingControlPoint.y}
          r={7}
          fill="var(--accent)"
          stroke="white"
          strokeWidth={2}
          style={{ cursor: 'grab', touchAction: 'none' }}
          onPointerDown={(e) => onControlPointerDown(e, pendingCurvedArrow.id)}
          onPointerMove={onControlPointerMove}
          onPointerUp={onControlPointerUp}
        />
      )}
    </g>
  )
}
