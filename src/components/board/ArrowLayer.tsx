import { useMemo, useState } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import type { Arrow, Point } from '@/store/types'
import { arrowInk, arrowPathD, badgePoint, midpoint, toView } from '@/utils/geometry'
import { useBoardView } from './boardView'

/** Arrow starts, following any player who is mid-drag. */
function useStarts(arrows: Arrow[]) {
  const live = useUI((s) => s.liveDrag)
  const players = useBoardStore((s) => s.players)
  return useMemo(() => arrows.map((a) => {
    if (!live || a.fromId !== live.id) return a.start
    const p = players.find((q) => q.id === live.id)
    return p ? { x: p.x + live.dx, y: p.y + live.dy } : a.start
  }), [arrows, live, players])
}

/** Ink lines, drawn in pitch units inside the (possibly rotated) pitch group. */
export function ArrowLines() {
  const arrows          = useBoardStore((s) => s.arrows)
  const selectedArrowId = useBoardStore((s) => s.selectedArrowId)
  const selectArrow     = useBoardStore((s) => s.selectArrow)
  const homeColour      = useBoardStore((s) => s.homeColour)
  const awayColour      = useBoardStore((s) => s.awayColour)
  const { scale } = useBoardView()
  const starts = useStarts(arrows)

  return (
    <g className="arrows">
      {arrows.map((a, i) => {
        const ink = arrowInk(a, homeColour, awayColour)
        const d = arrowPathD(a, starts[i])
        const sel = a.id === selectedArrowId
        const w = (a.type === 'press' ? 2.8 : 3.6) * (sel ? 1.5 : 1)
        return (
          <g
            key={a.id}
            data-arrow-id={a.id}
            className={`arw ${a.type} ${ink}${sel ? ' sel' : ''}`}
            onClick={(e) => { e.stopPropagation(); selectArrow(a.id) }}
          >
            <path className="hitp" d={d} strokeWidth={44 / scale} />
            <path
              className="ln"
              d={d}
              strokeWidth={Math.max(w, 2.6 / scale)}
              strokeDasharray={a.type === 'pass' ? `${9} ${7}` : undefined}
              strokeLinecap={a.type === 'pass' ? 'butt' : 'round'}
              pathLength={a.type === 'pass' ? undefined : 1}
              markerEnd={`url(#ah-${ink})`}
            />
          </g>
        )
      })}
    </g>
  )
}

/** Numbered step badges, upright in view space so the digits never rotate. */
export function ArrowBadges() {
  const arrows     = useBoardStore((s) => s.arrows)
  const homeColour = useBoardStore((s) => s.homeColour)
  const awayColour = useBoardStore((s) => s.awayColour)
  const { land, scale } = useBoardView()
  const starts = useStarts(arrows)
  const s = 13 / scale
  return (
    <g className="badges" aria-hidden="true">
      {arrows.map((a, i) => {
        const v = toView(badgePoint(a, 18 / scale, starts[i]), land)
        return (
          <g key={a.id} className={`badge ${arrowInk(a, homeColour, awayColour)}`} transform={`translate(${v.x} ${v.y})`}>
            <rect x={-s * 0.75} y={-s * 0.75} width={s * 1.5} height={s * 1.5} />
            <text y={s * 0.36} fontSize={s}>{i + 1}</text>
          </g>
        )
      })}
    </g>
  )
}

/** Drag handle that bends the selected arrow. One undo step per bend. */
export function CurveHandle() {
  const arrows             = useBoardStore((s) => s.arrows)
  const selectedArrowId    = useBoardStore((s) => s.selectedArrowId)
  const updateArrowControl = useBoardStore((s) => s.updateArrowControl)
  const playing = useUI((s) => s.playPhase !== 'idle')
  const { scale, clientToPitch } = useBoardView()
  const [drag, setDrag] = useState<Point | null>(null)

  const sel = arrows.find((a) => a.id === selectedArrowId)
  if (!sel || playing || sel.type === 'press') return null
  const base = sel.control ?? midpoint(sel.start, sel.end)
  // the handle sits on the curve (the quadratic's midpoint), not on the off-curve control point
  const ctrl = drag ?? base
  const on = { x: (sel.start.x + 2 * ctrl.x + sel.end.x) / 4, y: (sel.start.y + 2 * ctrl.y + sel.end.y) / 4 }
  const toCtrl = (p: Point) => ({ x: 2 * p.x - (sel.start.x + sel.end.x) / 2, y: 2 * p.y - (sel.start.y + sel.end.y) / 2 })

  return (
    <g
      className="handlewrap"
      aria-hidden="true"
      style={{ touchAction: 'none' }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        e.stopPropagation()
        ;(e.currentTarget as SVGGElement).setPointerCapture(e.pointerId)
        setDrag(base)
      }}
      onPointerMove={(e) => { if (drag) setDrag(toCtrl(clientToPitch(e.clientX, e.clientY))) }}
      onPointerUp={() => { if (drag) updateArrowControl(sel.id, drag); setDrag(null) }}
      onPointerCancel={() => setDrag(null)}
    >
      {drag && <path className="draft home" d={arrowPathD({ ...sel, style: 'curved', control: drag })} strokeWidth={2.6 / scale} strokeDasharray={`${8 / scale} ${6 / scale}`} />}
      <circle cx={on.x} cy={on.y} r={22 / scale} fill="transparent" style={{ cursor: 'grab' }} />
      <circle className="handle" cx={on.x} cy={on.y} r={8 / scale} strokeWidth={2 / scale} />
    </g>
  )
}
