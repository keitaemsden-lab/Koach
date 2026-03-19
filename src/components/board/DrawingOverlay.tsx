import { useCallback, useRef, useState } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { midpoint } from '@/utils/arrowPaths'
import { straightArrowPath } from '@/utils/arrowPaths'
import type { Point } from '@/store/types'

interface DrawingOverlayProps {
  svgRef: React.RefObject<SVGSVGElement | null>
}

export default function DrawingOverlay({ svgRef }: DrawingOverlayProps) {
  const mode         = useBoardStore((s) => s.mode)
  const arrowType    = useBoardStore((s) => s.arrowType)
  const drawingState = useBoardStore((s) => s.drawingState)
  const homeColour   = useBoardStore((s) => s.homeColour)
  const awayColour   = useBoardStore((s) => s.awayColour)
  const arrowTeam    = useBoardStore((s) => s.arrowTeam)
  const addArrow        = useBoardStore((s) => s.addArrow)
  const setDrawingState = useBoardStore((s) => s.setDrawingState)
  const selectArrow     = useBoardStore((s) => s.selectArrow)
  const arrows          = useBoardStore((s) => s.arrows)
  const updateArrowControl = useBoardStore((s) => s.updateArrowControl)
  const pitchOrientation   = useBoardStore((s) => s.pitchOrientation)

  const isLandscape = pitchOrientation === 'landscape'
  const VB_W = isLandscape ? 1050 : 680
  const VB_H = isLandscape ? 680 : 1050

  const draggingArrowId = useRef<string | null>(null)
  const [pendingCurveAdjustId, setPendingCurveAdjustId] = useState<string | null>(null)

  const resolvedColour = arrowTeam === 'home' ? homeColour : arrowTeam === 'away' ? awayColour : '#ffffff'

  const toSVG = useCallback((clientX: number, clientY: number): Point => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (VB_W / rect.width),
      y: (clientY - rect.top)  * (VB_H / rect.height),
    }
  }, [svgRef, VB_W, VB_H])

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
    const ctrl = midpoint(start, pt)
    addArrow({
      type: arrowType,
      style: 'curved',
      start,
      end: pt,
      control: ctrl,
      teamColour: resolvedColour,
    })

    // Immediately enable curve adjustment for the new arrow
    const arrows = useBoardStore.getState().arrows
    const newId = arrows[arrows.length - 1]?.id
    if (newId) {
      selectArrow(newId)
      setPendingCurveAdjustId(newId)
    }

    setDrawingState(null)
  }, [mode, drawingState, arrowType, resolvedColour, addArrow, setDrawingState, selectArrow, toSVG])

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
    ? straightArrowPath(drawingState.start, drawingState.currentPointer)
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
