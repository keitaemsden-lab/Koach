import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext, type DragEndEvent, type DragMoveEvent,
  MouseSensor, TouchSensor, useSensors, useSensor,
} from '@dnd-kit/core'
import PitchField from './PitchField'
import PlayerLayer from './PlayerLayer'
import { ArrowLines, ArrowBadges, CurveHandle } from './ArrowLayer'
import DrawingOverlay from './DrawingOverlay'
import { BoardViewContext, type BoardView } from './boardView'
import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import { boardDom } from '@/play/boardDom'
import { stopPlayback } from '@/play/playMove'
import {
  LANDSCAPE_MATRIX, clampToPitch, deltaToPortrait, prefersLandscape, toPortrait, viewBox, viewMargin,
} from '@/utils/geometry'

export default function BoardCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })

  const movePlayer      = useBoardStore((s) => s.movePlayer)
  const selectPlayer    = useBoardStore((s) => s.selectPlayer)
  const selectArrow     = useBoardStore((s) => s.selectArrow)
  const mode            = useBoardStore((s) => s.mode)
  const orientationPref = useBoardStore((s) => s.orientationPref)
  const playing         = useUI((s) => s.playPhase !== 'idle')
  const setLiveDrag     = useUI((s) => s.setLiveDrag)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      if (r.width && r.height) setSize((s) => (s.w === r.width && s.h === r.height ? s : { w: r.width, h: r.height }))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const land = orientationPref ? orientationPref === 'landscape' : prefersLandscape(size.w, size.h)
  const vb = viewBox(land)
  const scale = Math.min(size.w / vb.w, size.h / vb.h) || 0.5

  // a move in flight cannot survive the pitch turning under it
  useEffect(() => { stopPlayback() }, [land])

  useEffect(() => {
    boardDom.svg = svgRef.current
    boardDom.land = land
    boardDom.scale = scale
  }, [land, scale])
  useEffect(() => () => { boardDom.svg = null }, [])

  const clientToPitch = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current
    const m = svg?.getScreenCTM?.()
    if (!svg || !m) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = cx; pt.y = cy
    const v = pt.matrixTransform(m.inverse())
    return toPortrait({ x: v.x, y: v.y }, land)
  }, [land])

  const view: BoardView = useMemo(() => ({ land, scale, clientToPitch }), [land, scale, clientToPitch])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
  )

  const onDragMove = useCallback((e: DragMoveEvent) => {
    const d = deltaToPortrait({ x: e.delta.x / scale, y: e.delta.y / scale }, land)
    setLiveDrag({ id: String(e.active.id), dx: d.x, dy: d.y })
  }, [scale, land, setLiveDrag])

  const onDragEnd = useCallback((event: DragEndEvent) => {
    setLiveDrag(null)
    const { active, delta } = event
    if (!delta || (delta.x === 0 && delta.y === 0)) return
    const id = String(active.id)
    const player = useBoardStore.getState().players.find((p) => p.id === id)
    if (!player) return
    const d = deltaToPortrait({ x: delta.x / scale, y: delta.y / scale }, land)
    const n = clampToPitch({ x: player.x + d.x, y: player.y + d.y })
    movePlayer(id, n.x, n.y)
    selectPlayer(id)
  }, [movePlayer, selectPlayer, setLiveDrag, scale, land])

  const cls = ['pitch', mode === 'draw-arrow' ? 'drawing' : '', playing ? 'playing' : ''].filter(Boolean).join(' ')
  const rot = land ? LANDSCAPE_MATRIX : undefined

  return (
    <div className="pitchwrap" ref={wrapRef}>
      <BoardViewContext.Provider value={view}>
        <DndContext sensors={sensors} onDragMove={onDragMove} onDragEnd={onDragEnd} onDragCancel={() => setLiveDrag(null)}>
          <svg
            ref={svgRef}
            id="pitch"
            className={cls}
            viewBox={vb.str}
            role="application"
            aria-label="Pitch. Players are buttons: drag them, or focus one and use the arrow keys."
            tabIndex={-1}
            onClick={(e) => {
              if (mode !== 'select') return
              const t = e.target as Element
              if (t.closest?.('.pl, .arw, .handlewrap')) return
              selectPlayer(null)
              selectArrow(null)
            }}
          >
            <defs>
              <radialGradient id="flood" cx="50%" cy="50%" r="62%">
                <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.07" />
                <stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
              </radialGradient>
              {(['home', 'away', 'neutral'] as const).map((t) => (
                <marker key={t} id={`ah-${t}`} className={`ah ${t}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M0 0L10 5L0 10z" />
                </marker>
              ))}
            </defs>
            <g transform={rot}>
              <PitchField margin={viewMargin(land)} />
              <ArrowLines />
            </g>
            <g className="fx-under" />
            <PlayerLayer />
            <g className="fx-over" />
            <ArrowBadges />
            <DrawingOverlay />
            <g transform={rot}>
              <CurveHandle />
            </g>
          </svg>
        </DndContext>
      </BoardViewContext.Provider>
    </div>
  )
}
