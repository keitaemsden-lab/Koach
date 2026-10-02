import { useEffect, useRef } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import type { PositionLabel } from '@/store/types'

const POSITIONS: PositionLabel[] = [
  'GK', 'RB', 'LB', 'CB', 'RCB', 'LCB', 'RWB', 'LWB',
  'CDM', 'CM', 'RCM', 'LCM', 'CAM', 'DM', 'RW', 'LW', 'RAM', 'LAM', 'CF', 'ST', 'SS',
]

/**
 * The broadcast lower third: the selected player's number, name and position (or the selected
 * arrow), otherwise a one-line hint. Lives in the match sheet on desktop and the dock on phones.
 */
export default function SelectionCard() {
  const players = useBoardStore((s) => s.players)
  const arrows = useBoardStore((s) => s.arrows)
  const selectedPlayerId = useBoardStore((s) => s.selectedPlayerId)
  const selectedArrowId = useBoardStore((s) => s.selectedArrowId)
  const mode = useBoardStore((s) => s.mode)
  const drawingState = useBoardStore((s) => s.drawingState)
  const updatePlayer = useBoardStore((s) => s.updatePlayer)
  const removePlayer = useBoardStore((s) => s.removePlayer)
  const removeArrow = useBoardStore((s) => s.removeArrow)
  const selectPlayer = useBoardStore((s) => s.selectPlayer)
  const selectArrow = useBoardStore((s) => s.selectArrow)
  const focusName = useUI((s) => s.focusName)
  const playing = useUI((s) => s.playPhase !== 'idle')
  const nameRef = useRef<HTMLInputElement>(null)

  const p = players.find((q) => q.id === selectedPlayerId)
  const ai = arrows.findIndex((a) => a.id === selectedArrowId)

  useEffect(() => {
    if (focusName && nameRef.current) { nameRef.current.focus(); nameRef.current.select() }
  }, [focusName])

  if (p) {
    const side = p.team === 'home' ? 'Home' : 'Opposition'
    return (
      <div className="sel on" aria-live="polite">
        <div className="sel-top">
          <p className="sel-k">{side} <span className="mono">{p.position}</span></p>
          <button className="btn quiet" onClick={() => removePlayer(p.id)} disabled={playing} aria-label="Remove player">Remove</button>
          <button className="btn" onClick={() => selectPlayer(null)}>Done</button>
        </div>
        <div className="sel-row">
          <label className="fld fld-n"><span>No.</span>
            <input
              key={p.id + ':n'}
              inputMode="numeric"
              placeholder="No."
              maxLength={2}
              defaultValue={p.number ?? ''}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                updatePlayer(p.id, { number: n > 0 && n < 100 ? n : undefined })
              }}
            />
          </label>
          <label className="fld fld-name"><span>Name</span>
            <input
              key={p.id + ':name'}
              ref={nameRef}
              maxLength={14}
              defaultValue={/^#\d+$/.test(p.name) ? '' : p.name}
              placeholder="Name"
              onChange={(e) => updatePlayer(p.id, { name: e.target.value.slice(0, 14) })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); selectPlayer(null) } }}
            />
          </label>
          <label className="fld fld-pos"><span>Position</span>
            <select value={p.position} onChange={(e) => updatePlayer(p.id, { position: e.target.value as PositionLabel })}>
              {POSITIONS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
        </div>
      </div>
    )
  }

  if (ai >= 0) {
    const a = arrows[ai]
    const who = a.team === 'away' ? 'opposition' : a.team === 'neutral' ? 'chalk' : 'home'
    return (
      <div className="sel on" aria-live="polite">
        <div className="sel-top">
          <p className="sel-k">Step <span className="mono">{String(ai + 1).padStart(2, '0')}</span> {a.type}, {who}</p>
          <button className="btn quiet" onClick={() => removeArrow(a.id)} aria-label="Delete arrow">Delete</button>
          <button className="btn" onClick={() => selectArrow(null)}>Done</button>
        </div>
        <p className="hint">{a.type === 'press' ? 'Delete removes it; Undo brings it back.' : 'Drag the yellow handle to bend it.'}</p>
      </div>
    )
  }

  const hint = playing
    ? 'Playing the move. Press Stop or Back to return to the board.'
    : mode === 'draw-arrow'
      ? drawingState
        ? 'Now tap where the arrow ends.'
        : 'Drag from a player to draw, or tap the start then the end.'
      : 'Drag a player to move them. Tap one to rename, tap an arrow to bend or delete it.'
  return <div className="sel" aria-live="polite"><p className="hint">{hint}</p></div>
}
