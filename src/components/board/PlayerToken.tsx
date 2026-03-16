import { useDraggable } from '@dnd-kit/core'
import type { Player, Mode } from '@/store/types'

interface PlayerTokenProps {
  player: Player
  colour: string
  isSelected: boolean
  onSelect: () => void
  svgRef: React.RefObject<SVGSVGElement | null>
  mode: Mode
}

export default function PlayerToken({
  player, colour, isSelected, onSelect, svgRef, mode,
}: PlayerTokenProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    disabled: mode === 'draw-arrow',
  })

  const svg = svgRef.current
  const rect = svg?.getBoundingClientRect()
  const scaleX = rect ? 680 / rect.width : 1
  const scaleY = rect ? 1050 / rect.height : 1

  const dx = transform ? transform.x * scaleX : 0
  const dy = transform ? transform.y * scaleY : 0

  const shortName = player.name.length > 8 ? player.name.slice(0, 7) + '…' : player.name

  return (
    <g
      ref={setNodeRef as (el: SVGGElement | null) => void}
      transform={`translate(${player.x + dx}, ${player.y + dy})`}
      style={{
        cursor: isDragging ? 'grabbing' : (mode === 'draw-arrow' ? 'crosshair' : 'grab'),
        filter: isDragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : undefined,
        touchAction: 'none',
      }}
      onClick={(e) => {
        if (mode === 'draw-arrow') return
        e.stopPropagation()
        onSelect()
      }}
      {...attributes}
      {...(mode === 'select' ? listeners : {})}
    >
      {/* Selection ring */}
      {isSelected && (
        <circle
          r={21}
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeDasharray="4 3"
          opacity={0.9}
        />
      )}
      {/* Body */}
      <circle r={16} fill={colour} stroke="white" strokeWidth={2} />
      {/* Position label */}
      <text
        fontSize={10}
        fontWeight="bold"
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
        fill="white"
        textAnchor="middle"
        dominantBaseline="hanging"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {shortName}
      </text>
    </g>
  )
}
