import { useRef, useState } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import type { Point } from '@/store/types'
import { LANDSCAPE_MATRIX, controlFromStroke, playerAt, viewBox } from '@/utils/geometry'
import { useBoardView } from './boardView'

/** Shortest stroke (pitch units, 2.5 m) that counts as a drawn arrow rather than a tap. */
export const MIN_STROKE = 25

/**
 * Draw mode. Drag from a player (or anywhere) to draw an arrow that follows your stroke.
 * Or tap where it starts, then tap where it ends (the original click-click way); the new
 * arrow is selected so its bend handle can shape it.
 */
export default function DrawingOverlay() {
  const mode            = useBoardStore((s) => s.mode)
  const drawingState    = useBoardStore((s) => s.drawingState)
  const playing         = useUI((s) => s.playPhase !== 'idle')
  const arrowTeam       = useBoardStore((s) => s.arrowTeam)
  const pendingTeam     = useBoardStore((s) => s.players.find((p) => p.id === s.drawingState?.fromId)?.team)
  const { land, scale, clientToPitch } = useBoardView()
  const [drawn, setDrawn] = useState<{ pts: Point[], team: 'home' | 'away' | 'neutral' } | null>(null)
  const stroke = useRef<{ pts: Point[], fromId?: string, team: 'home' | 'away' | 'neutral' } | null>(null)

  if (mode !== 'draw-arrow' || playing) return null
  const vb = viewBox(land)

  function commit(start: Point, end: Point, fromId: string | undefined, control: Point | undefined, select: boolean) {
    const s = useBoardStore.getState()
    const from = fromId ? s.players.find((p) => p.id === fromId) : undefined
    const team = from ? from.team : s.arrowTeam
    const colour = team === 'home' ? s.homeColour : team === 'away' ? s.awayColour : '#B9CBB8'
    s.addArrow({
      type: s.arrowType,
      style: 'curved',
      start,
      end,
      control: s.arrowType === 'run' ? control : undefined,
      teamColour: colour,
      team,
      fromId,
    })
    const added = useBoardStore.getState().arrows
    if (select) s.selectArrow(added[added.length - 1]?.id ?? null)
  }

  const draft = drawn && drawn.pts.length > 1 ? drawn.pts.map((p) => `${p.x},${p.y}`).join(' ') : null
  const team = drawn?.team ?? pendingTeam ?? arrowTeam

  return (
    <g className="drawing-layer">
      <rect
        className="capture"
        x={vb.x} y={vb.y} width={vb.w} height={vb.h}
        onPointerDown={(e) => {
          if (e.button > 0) return
          e.preventDefault()
          ;(e.currentTarget as SVGRectElement).setPointerCapture(e.pointerId)
          const s = useBoardStore.getState()
          const pt = clientToPitch(e.clientX, e.clientY)
          const on = playerAt(s.players, pt, 22 / scale)
          const start = on ? { x: on.x, y: on.y } : pt
          stroke.current = { pts: [start], fromId: on?.id, team: on ? on.team : s.arrowTeam }
          setDrawn({ pts: [start], team: stroke.current.team })
        }}
        onPointerMove={(e) => {
          const pt = clientToPitch(e.clientX, e.clientY)
          const st = stroke.current
          if (st) {
            const last = st.pts[st.pts.length - 1]
            if (Math.hypot(pt.x - last.x, pt.y - last.y) > 3.5) { st.pts.push(pt); setDrawn({ pts: [...st.pts], team: st.team }) }
            return
          }
          const ds = useBoardStore.getState().drawingState
          if (ds) useBoardStore.getState().setDrawingState({ ...ds, currentPointer: pt })
        }}
        onPointerUp={(e) => {
          const st = stroke.current
          stroke.current = null
          setDrawn(null)
          if (!st) return
          const s = useBoardStore.getState()
          const start = st.pts[0]
          const end = clientToPitch(e.clientX, e.clientY)
          if (Math.hypot(end.x - start.x, end.y - start.y) >= MIN_STROKE) {
            commit(start, end, st.fromId, controlFromStroke([...st.pts, end]), false)
            s.setDrawingState(null)
            return
          }
          // a tap: first tap places the start, the second tap finishes the arrow
          const ds = s.drawingState
          if (ds) {
            if (Math.hypot(end.x - ds.start.x, end.y - ds.start.y) < 8) { s.setDrawingState(null); return }
            commit(ds.start, end, ds.fromId, undefined, true)
            s.setDrawingState(null)
          } else {
            s.setDrawingState({ phase: 'start-placed', start, currentPointer: start, fromId: st.fromId })
          }
        }}
        onPointerCancel={() => { stroke.current = null; setDrawn(null) }}
      />
      <g transform={land ? LANDSCAPE_MATRIX : undefined}>
        {drawingState && (
          <>
            <circle className="startdot" cx={drawingState.start.x} cy={drawingState.start.y} r={6 / scale} />
            <path
              className={`draft ${team}`}
              d={`M${drawingState.start.x} ${drawingState.start.y}L${drawingState.currentPointer.x} ${drawingState.currentPointer.y}`}
              strokeWidth={2.4 / scale}
              strokeDasharray={`${8 / scale} ${6 / scale}`}
            />
          </>
        )}
        {draft && <polyline className={`draft ${team}`} points={draft} strokeWidth={3.4 / scale} />}
      </g>
    </g>
  )
}
