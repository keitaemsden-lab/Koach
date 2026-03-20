import { memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useRef } from 'react'
import type { Player, Mode } from '@/store/types'
import { lightenColour } from '@/utils/colour'
import { useSVGCoordinates } from '@/hooks/useSVGCoordinates'

interface PlayerTokenProps {
  player: Player
  colour: string
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  svgRef: React.RefObject<SVGSVGElement | null>
  mode: Mode
}

function PlayerToken({
  player, colour, isSelected, onSelect, onEdit, svgRef, mode,
}: PlayerTokenProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    disabled: mode === 'draw-arrow',
  })

  const { VB_W, VB_H, scaleX, scaleY } = useSVGCoordinates(svgRef)

  const dx = transform ? transform.x * scaleX : 0
  const dy = transform ? transform.y * scaleY : 0

  const rawX = player.x + dx
  const rawY = player.y + dy
  const clampedX = isDragging ? Math.max(16, Math.min(VB_W - 16, rawX)) : rawX
  const clampedY = isDragging ? Math.max(16, Math.min(VB_H - 16, rawY)) : rawY

  const shortName = player.name.length > 8 ? player.name.slice(0, 7) + '…' : player.name
  const lastTouchTapTs = useRef(0)

  function maybeHandleDoubleTap(e: React.PointerEvent<SVGGElement>) {
    if (e.pointerType !== 'touch' || mode === 'draw-arrow' || isDragging) return
    const now = Date.now()
    if (now - lastTouchTapTs.current < 320) {
      e.stopPropagation()
      onEdit()
    }
    lastTouchTapTs.current = now
  }

  return (
    <g
      ref={setNodeRef as (el: SVGGElement | null) => void}
      transform={`translate(${clampedX}, ${clampedY}) ${isDragging ? 'scale(1.15)' : ''}`}
      style={{
        cursor: isDragging ? 'grabbing' : (mode === 'draw-arrow' ? 'crosshair' : 'grab'),
        filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))' : undefined,
        transition: isDragging ? 'none' : 'transform 150ms ease',
        touchAction: 'none',
        outline: 'none',
      }}
      onClick={(e) => {
        if (mode === 'draw-arrow') return
        e.stopPropagation()
        onSelect()
      }}
      onDoubleClick={(e) => {
        if (mode === 'draw-arrow') return
        e.stopPropagation()
        onEdit()
      }}
      onPointerUp={maybeHandleDoubleTap}
      {...attributes}
      {...(mode === 'select' ? listeners : {})}
    >
      {/* Per-token SVG defs — IDs namespaced to prevent DOM collisions across 22 tokens */}
      <defs>
        <radialGradient id={`grad-${player.id}-${colour.replace('#', '')}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={lightenColour(colour, 0.25)} />
          <stop offset="100%" stopColor={colour} />
        </radialGradient>
        <filter id={`shadow-${player.id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.4" />
        </filter>
        <filter id={`glow-${player.id}-${colour.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={colour} floodOpacity="0.85" />
        </filter>
      </defs>

      {/* Token body — stroke is unconditional; selection is communicated via glow filter only.
          Drag shadow is handled by the <g> style above — no isDragging branch needed here. */}
      <circle
        r={16}
        fill={`url(#grad-${player.id}-${colour.replace('#', '')})`}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1.5}
        filter={isSelected ? `url(#glow-${player.id}-${colour.replace('#', '')})` : `url(#shadow-${player.id})`}
      />

      {/* Inner shimmer ring */}
      <circle r={12} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

      {/* Position label */}
      <text
        fontSize={11}
        fontWeight={800}
        fontFamily="Inter, sans-serif"
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {player.position}
      </text>

      {/* Player name */}
      <text
        y={25}
        fontSize={9}
        fontWeight={500}
        fontFamily="Inter, sans-serif"
        fill="rgba(255,255,255,0.9)"
        textAnchor="middle"
        dominantBaseline="hanging"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {shortName}
      </text>
    </g>
  )
}

PlayerToken.displayName = 'PlayerToken'
export default memo(PlayerToken)
