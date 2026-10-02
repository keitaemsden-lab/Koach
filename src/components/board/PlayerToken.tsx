import { memo, useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { Player } from '@/store/types'
import { inkOn, toView } from '@/utils/geometry'

interface PlayerTokenProps {
  player: Player
  colour: string
  isSelected: boolean
  draggable: boolean
  land: boolean
  scale: number
  showName: boolean
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onNudge: (id: string, dx: number, dy: number) => void
}

const KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
}

function PlayerToken({
  player, colour, isSelected, draggable, land, scale, showName, onSelect, onEdit, onNudge,
}: PlayerTokenProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    disabled: !draggable,
  })
  const lastTap = useRef(0)

  const big = scale >= 0.7
  const rpx = big ? 19 : 13
  const r = rpx / scale
  const hit = Math.max(22, rpx + 6) / scale
  const num = (big ? 15 : 11.5) / scale
  const nm = 13 / scale

  const base = toView(player, land)
  const vx = base.x + (transform ? transform.x / scale : 0)
  const vy = base.y + (transform ? transform.y / scale : 0)

  const label = player.number != null ? String(player.number) : player.position
  const under = player.name && !/^#\d+$/.test(player.name) ? player.name : player.position
  const side = player.team === 'home' ? 'Home' : 'Opposition'
  const aria = `${side} ${player.number ?? ''}${player.name ? ' ' + player.name : ''}, ${player.position}. Arrow keys move.`.replace(/\s+/g, ' ')

  return (
    <g
      ref={setNodeRef as (el: SVGGElement | null) => void}
      data-player-id={player.id}
      className={`pl ${player.team}${isSelected ? ' sel' : ''}${isDragging ? ' dragging' : ''}`}
      style={{ transform: `translate(${vx}px, ${vy}px)` }}
      {...attributes}
      {...(draggable ? listeners : {})}
      role="button"
      tabIndex={0}
      aria-label={aria}
      aria-pressed={isSelected}
      aria-roledescription="player"
      onClick={(e) => { if (!draggable) return; e.stopPropagation(); onSelect(player.id) }}
      onDoubleClick={(e) => { if (!draggable) return; e.stopPropagation(); onEdit(player.id) }}
      onPointerUp={(e) => {
        if (e.pointerType !== 'touch' || !draggable || isDragging) return
        const now = Date.now()
        if (now - lastTap.current < 320) { e.stopPropagation(); onEdit(player.id) }
        lastTap.current = now
      }}
      onKeyDown={(e) => {
        const k = KEYS[e.key]
        if (k && draggable) {
          e.preventDefault()
          const step = e.shiftKey ? 50 : 10
          // keys move on screen; convert the screen direction to pitch units
          const [sx, sy] = k
          const d = land ? { x: sy, y: -sx } : { x: sx, y: sy }
          onNudge(player.id, d.x * step, d.y * step)
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(player.id)
        }
      }}
    >
      <circle className="hit" r={hit} />
      <circle className="ring" r={r * 1.75} strokeWidth={2 / scale} />
      <circle className="tok" r={r} fill={colour} strokeWidth={1.8 / scale} />
      <text className="num" y={num * 0.36} fontSize={label.length > 2 ? num * 0.8 : num} fill={inkOn(colour)}>{label}</text>
      {showName && (
        <text className={'nm' + (under === player.position ? ' posl' : '')} y={r + nm * 1.15} fontSize={nm} strokeWidth={5.5 / scale}>
          {under.length > 14 ? under.slice(0, 13) + '…' : under}
        </text>
      )}
    </g>
  )
}

PlayerToken.displayName = 'PlayerToken'
export default memo(PlayerToken)
