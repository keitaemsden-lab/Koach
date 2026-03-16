import { useState, useEffect, useRef } from 'react'
import { useBoardStore } from '@/store/boardStore'
import type { Player, PositionLabel } from '@/store/types'

const POSITIONS: PositionLabel[] = [
  'GK',
  'RB', 'LB', 'CB', 'RCB', 'LCB', 'RWB', 'LWB',
  'CDM', 'CM', 'RCM', 'LCM', 'CAM', 'DM',
  'RW', 'LW', 'RAM', 'LAM',
  'CF', 'ST', 'SS',
]

interface PlayerEditPopoverProps {
  player: Player
  svgRef: React.RefObject<SVGSVGElement | null>
}

export default function PlayerEditPopover({ player, svgRef }: PlayerEditPopoverProps) {
  const updatePlayer = useBoardStore((s) => s.updatePlayer)
  const removePlayer = useBoardStore((s) => s.removePlayer)
  const selectPlayer = useBoardStore((s) => s.selectPlayer)

  const [name, setName] = useState(player.name)
  const [position, setPosition] = useState<PositionLabel>(player.position)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Sync fields when player changes
  useEffect(() => {
    setName(player.name)
    setPosition(player.position)
  }, [player.id, player.name, player.position])

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        applyChanges()
        selectPlayer(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  })

  function applyChanges() {
    updatePlayer(player.id, { name, position })
  }

  // Calculate position relative to the SVG element
  const svg = svgRef.current
  const svgRect = svg?.getBoundingClientRect()
  const containerRect = svg?.parentElement?.getBoundingClientRect()

  if (!svgRect || !containerRect) return null

  const scaleX = svgRect.width / 680
  const scaleY = svgRect.height / 1050
  const screenX = (svgRect.left - containerRect.left) + player.x * scaleX
  const screenY = (svgRect.top  - containerRect.top)  + player.y * scaleY

  // Offset the popover so it appears above/beside the token
  const popLeft = Math.min(screenX - 80, containerRect.width - 168)
  const popTop  = screenY - 140

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 rounded-lg shadow-xl p-3 w-40"
      style={{
        left: Math.max(0, popLeft),
        top:  Math.max(0, popTop),
        backgroundColor: 'var(--bg-toolbar)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        fontFamily: 'DM Mono, monospace',
        fontSize: 12,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2">
        <label className="block mb-1" style={{ color: 'var(--text-secondary)', fontSize: 10 }}>NAME</label>
        <input
          className="w-full rounded px-2 py-1 text-xs"
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
          }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { applyChanges(); selectPlayer(null) }
            if (e.key === 'Escape') selectPlayer(null)
            e.stopPropagation()
          }}
          autoFocus
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1" style={{ color: 'var(--text-secondary)', fontSize: 10 }}>POSITION</label>
        <select
          className="w-full rounded px-2 py-1 text-xs"
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
          }}
          value={position}
          onChange={(e) => {
            const p = e.target.value as PositionLabel
            setPosition(p)
            updatePlayer(player.id, { position: p })
          }}
        >
          {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <button
        className="w-full rounded py-1 text-xs font-medium"
        style={{ background: '#dc2626', color: 'white' }}
        onClick={() => { removePlayer(player.id); selectPlayer(null) }}
      >
        Remove
      </button>
    </div>
  )
}
