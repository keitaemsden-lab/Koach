import { useCallback } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import { clampToPitch } from '@/utils/geometry'
import PlayerToken from './PlayerToken'
import { useBoardView } from './boardView'

export default function PlayerLayer() {
  const players          = useBoardStore((s) => s.players)
  const homeColour       = useBoardStore((s) => s.homeColour)
  const awayColour       = useBoardStore((s) => s.awayColour)
  const selectedPlayerId = useBoardStore((s) => s.selectedPlayerId)
  const selectPlayer     = useBoardStore((s) => s.selectPlayer)
  const movePlayer       = useBoardStore((s) => s.movePlayer)
  const mode             = useBoardStore((s) => s.mode)
  const playing          = useUI((s) => s.playPhase !== 'idle')
  const requestNameFocus = useUI((s) => s.requestNameFocus)
  const { land, scale } = useBoardView()

  const onEdit = useCallback((id: string) => { selectPlayer(id); requestNameFocus() }, [selectPlayer, requestNameFocus])
  const onNudge = useCallback((id: string, dx: number, dy: number) => {
    const p = useBoardStore.getState().players.find((q) => q.id === id)
    if (!p) return
    const n = clampToPitch({ x: p.x + dx, y: p.y + dy })
    movePlayer(id, n.x, n.y)
  }, [movePlayer])

  return (
    <g className="players" key={land ? 'land' : 'port'}>
      {players.map((player) => (
        <PlayerToken
          key={player.id}
          player={player}
          colour={player.team === 'home' ? homeColour : awayColour}
          isSelected={player.id === selectedPlayerId}
          draggable={mode === 'select' && !playing}
          land={land}
          scale={scale}
          showName={scale >= 0.7}
          onSelect={selectPlayer}
          onEdit={onEdit}
          onNudge={onNudge}
        />
      ))}
    </g>
  )
}
