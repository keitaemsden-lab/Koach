import { useState, useEffect, useRef, useCallback } from 'react'
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
  onClose: () => void
}

export default function PlayerEditPopover({ player, svgRef, onClose }: PlayerEditPopoverProps) {
  const updatePlayer = useBoardStore((s) => s.updatePlayer)
  const removePlayer = useBoardStore((s) => s.removePlayer)
  const selectPlayer = useBoardStore((s) => s.selectPlayer)

  const [name, setName] = useState(player.name)
  const [position, setPosition] = useState<PositionLabel>(player.position)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Fields are initialised from the player; the parent remounts this component
  // (key={player.id}) when a different player is opened.
  const applyAndClose = useCallback(() => {
    updatePlayer(player.id, { name, position })
    selectPlayer(null)
    onClose()
  }, [name, position, player.id, updatePlayer, selectPlayer, onClose])

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        applyAndClose()
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { selectPlayer(null); onClose() }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', onKey)
    }
  }, [applyAndClose, selectPlayer, onClose])

  const [coords, setCoords] = useState<{ left: number, top: number } | null>(null)

  const pitchOrientation = useBoardStore((s) => s.pitchOrientation)
  const isLandscape = pitchOrientation === 'landscape'
  const VB_W = isLandscape ? 1050 : 680
  const VB_H = isLandscape ? 680 : 1050

  useEffect(() => {
    function updateCoords() {
      const svg = svgRef.current
      if (!svg) return
      const svgRect = svg.getBoundingClientRect()
      const containerRect = svg.parentElement?.getBoundingClientRect()
      if (!svgRect || !containerRect) return

      const scaleX = svgRect.width / VB_W
      const scaleY = svgRect.height / VB_H
      const screenX = (svgRect.left - containerRect.left) + player.x * scaleX
      const screenY = (svgRect.top  - containerRect.top)  + player.y * scaleY

      const POPOVER_W = 160
      const POPOVER_H = 200

      const left = Math.max(
        4,
        Math.min(
          screenX - POPOVER_W / 2,
          containerRect.width - POPOVER_W - 4
        )
      )

      const top = Math.max(
        4,
        Math.min(
          screenY - POPOVER_H - 20,
          containerRect.height - POPOVER_H - 4
        )
      )

      setCoords({ left, top })
    }

    updateCoords()
    window.addEventListener('resize', updateCoords)
    return () => window.removeEventListener('resize', updateCoords)
  }, [svgRef, player.x, player.y, VB_W, VB_H])

  if (!coords) return null

  const popLeft = coords.left
  const popTop = coords.top

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Edit player ${player.name}`}
      className="absolute z-50 rounded-lg shadow-xl p-3 w-40"
      style={{
        left: popLeft,
        top:  popTop,
        backgroundColor: 'var(--bg-toolbar)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        fontFamily: 'DM Mono, monospace',
        fontSize: 12,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2">
        <label htmlFor="player-edit-name" className="block mb-1" style={{ color: 'var(--text-secondary)', fontSize: 10 }}>NAME</label>
        <input
          id="player-edit-name"
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
            if (e.key === 'Enter') { applyAndClose() }
            if (e.key === 'Escape') { selectPlayer(null); onClose() }
          }}
          autoFocus
        />
      </div>
      <div className="mb-3">
        <label htmlFor="player-edit-position" className="block mb-1" style={{ color: 'var(--text-secondary)', fontSize: 10 }}>POSITION</label>
        <select
          id="player-edit-position"
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
        onClick={() => { removePlayer(player.id); selectPlayer(null); onClose() }}
      >
        Remove
      </button>
    </div>
  )
}
