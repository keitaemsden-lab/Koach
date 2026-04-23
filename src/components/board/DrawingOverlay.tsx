import { useCallback } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { midpoint } from '@/utils/arrowPaths'
import { straightArrowPath } from '@/utils/arrowPaths'
import { useSVGCoordinates } from '@/hooks/useSVGCoordinates'

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
  const setMode         = useBoardStore((s) => s.setMode)
  const { VB_W, VB_H, toSVG } = useSVGCoordinates(svgRef)

  const resolvedColour = arrowTeam === 'home' ? homeColour : arrowTeam === 'away' ? awayColour : '#ffffff'

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

    // Select the new arrow then switch to select mode so the curve handle appears immediately
    const arrows = useBoardStore.getState().arrows
    const newId = arrows[arrows.length - 1]?.id
    if (newId) selectArrow(newId)
    setMode('select')  // also clears drawingState
  }, [mode, drawingState, arrowType, resolvedColour, addArrow, setDrawingState, selectArrow, setMode, toSVG])

  if (mode !== 'draw-arrow') return null

  const previewPath = drawingState
    ? straightArrowPath(drawingState.start, drawingState.currentPointer)
    : null

  return (
    <g>
      {/* Transparent capture rect */}
      <rect
        x={0} y={0} width={VB_W} height={VB_H}
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
    </g>
  )
}
