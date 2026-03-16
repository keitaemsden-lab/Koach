import { useBoardStore } from '@/store/boardStore'
import PlayerToken from './PlayerToken'

interface PlayerLayerProps {
  svgRef: React.RefObject<SVGSVGElement | null>
}

export default function PlayerLayer({ svgRef }: PlayerLayerProps) {
  const players        = useBoardStore((s) => s.players)
  const homeColour     = useBoardStore((s) => s.homeColour)
  const awayColour     = useBoardStore((s) => s.awayColour)
  const selectedPlayerId = useBoardStore((s) => s.selectedPlayerId)
  const selectPlayer   = useBoardStore((s) => s.selectPlayer)
  const mode           = useBoardStore((s) => s.mode)

  return (
    <g>
      {players.map((player) => (
        <PlayerToken
          key={player.id}
          player={player}
          colour={player.team === 'home' ? homeColour : awayColour}
          isSelected={player.id === selectedPlayerId}
          svgRef={svgRef}
          onSelect={() => selectPlayer(player.id)}
          mode={mode}
        />
      ))}
    </g>
  )
}
