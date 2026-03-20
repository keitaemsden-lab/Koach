import { useRef, useCallback } from 'react'
import { useBoardStore } from '@/store/boardStore'
import ArrowElement from './ArrowElement'
import { useSVGCoordinates } from '@/hooks/useSVGCoordinates'

interface ArrowLayerProps {
  svgRef: React.RefObject<SVGSVGElement | null>
}

export default function ArrowLayer({ svgRef }: ArrowLayerProps) {
  const arrows          = useBoardStore((s) => s.arrows)
  const selectedArrowId = useBoardStore((s) => s.selectedArrowId)
  const selectArrow     = useBoardStore((s) => s.selectArrow)
  const removeArrow     = useBoardStore((s) => s.removeArrow)
  const updateArrowControl = useBoardStore((s) => s.updateArrowControl)
  const mode            = useBoardStore((s) => s.mode)

  const { toSVG } = useSVGCoordinates(svgRef)
  const draggingArrowId = useRef<string | null>(null)

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
  }, [])

  return (
    <g style={{ pointerEvents: mode === 'draw-arrow' ? 'none' : 'all' }}>
      {arrows.map((arrow) => (
        <ArrowElement
          key={arrow.id}
          arrow={arrow}
          isSelected={arrow.id === selectedArrowId}
          onClick={(e) => { e.stopPropagation(); selectArrow(arrow.id) }}
          onDelete={() => removeArrow(arrow.id)}
        />
      ))}

      {/* Draggable control point for selected curved arrow */}
      {(() => {
        const sel = arrows.find((a) => a.id === selectedArrowId && a.style === 'curved')
        if (!sel) return null
        const cp = sel.control ?? {
          x: (sel.start.x + sel.end.x) / 2,
          y: (sel.start.y + sel.end.y) / 2,
        }
        return (
          <circle
            cx={cp.x}
            cy={cp.y}
            r={7}
            fill="var(--accent)"
            stroke="white"
            strokeWidth={2}
            style={{ cursor: 'grab', touchAction: 'none' }}
            onPointerDown={(e) => onControlPointerDown(e, sel.id)}
            onPointerMove={onControlPointerMove}
            onPointerUp={onControlPointerUp}
          />
        )
      })()}
    </g>
  )
}
