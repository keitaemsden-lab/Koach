import { straightArrowPath, curvedArrowPath } from '@/utils/arrowPaths'
import type { Arrow } from '@/store/types'

const ARROW_COLOURS: Record<string, string> = {
  run:   '',        // uses teamColour
  pass:  '#f59e0b', // amber-500
  press: '#ef4444', // red-500
}

const DASHARRAY: Record<string, string | undefined> = {
  run:   undefined,
  pass:  '8 4',
  press: '2 4',
}

interface ArrowElementProps {
  arrow: Arrow
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
}

export default function ArrowElement({ arrow, isSelected, onClick }: ArrowElementProps) {
  const colour = arrow.type === 'run' ? arrow.teamColour : ARROW_COLOURS[arrow.type]
  const stroke = isSelected ? 'var(--accent)' : colour
  const dashArray = DASHARRAY[arrow.type]

  const mid = arrow.control ?? {
    x: (arrow.start.x + arrow.end.x) / 2,
    y: (arrow.start.y + arrow.end.y) / 2,
  }
  const d =
    arrow.style === 'curved' && arrow.control
      ? curvedArrowPath(arrow.start, arrow.end, arrow.control)
      : straightArrowPath(arrow.start, arrow.end)

  const markerId = `arrowhead-${arrow.id}`

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={stroke} />
        </marker>
      </defs>

      {/* Invisible hit area */}
      <path
        d={d}
        stroke="transparent"
        strokeWidth={16}
        fill="none"
        style={{ pointerEvents: 'stroke' }}
      />

      {/* Visible arrow */}
      <path
        d={d}
        stroke={stroke}
        strokeWidth={2.5}
        fill="none"
        strokeDasharray={dashArray}
        markerEnd={`url(#${markerId})`}
        opacity={0.9}
        style={{ pointerEvents: 'none' }}
      />

      {/* Selected midpoint indicator */}
      {isSelected && (
        <circle
          cx={mid.x}
          cy={mid.y}
          r={5}
          fill="var(--accent)"
          stroke="white"
          strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  )
}
