import { useRef, useCallback, useState } from 'react'
import {
  DndContext, type DragEndEvent,
  PointerSensor, TouchSensor,
  useSensors, useSensor,
} from '@dnd-kit/core'
import PitchSVG from './PitchSVG'
import PlayerLayer from './PlayerLayer'
import ArrowLayer from './ArrowLayer'
import DrawingOverlay from './DrawingOverlay'
import PlayerEditPopover from '@/components/ui/PlayerEditPopover'
import { useBoardStore } from '@/store/boardStore'

interface BoardCanvasProps {
  boardRef: React.RefObject<HTMLDivElement | null>
}

export default function BoardCanvas({ boardRef }: BoardCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const movePlayer     = useBoardStore((s) => s.movePlayer)
  const selectPlayer   = useBoardStore((s) => s.selectPlayer)
  const selectArrow    = useBoardStore((s) => s.selectArrow)
  const players        = useBoardStore((s) => s.players)
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const selectedPlayer = players.find((p) => p.id === editingPlayerId) ?? null

  const openPlayerEditor = useCallback((id: string) => {
    selectPlayer(id)
    setEditingPlayerId(id)
  }, [selectPlayer])

  const closePlayerEditor = useCallback(() => {
    setEditingPlayerId(null)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event
    if (!delta || (delta.x === 0 && delta.y === 0)) return
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scaleX = 680 / rect.width
    const scaleY = 1050 / rect.height
    const id = String(active.id)
    const player = useBoardStore.getState().players.find((p) => p.id === id)
    if (!player) return
    movePlayer(
      id,
      Math.max(10, Math.min(670, player.x + delta.x * scaleX)),
      Math.max(10, Math.min(1040, player.y + delta.y * scaleY)),
    )
  }, [movePlayer])

  return (
    <div
      className="relative flex items-center justify-center w-full h-full"
      style={{ overflow: 'hidden', padding: '12px 8px' }}
      onClick={() => { selectPlayer(null); selectArrow(null); closePlayerEditor() }}
    >
      <div
        ref={boardRef}
        className="relative flex-shrink-0"
        style={{ aspectRatio: '680 / 1050', height: '100%', maxWidth: '100%' }}
      >
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <svg
            ref={svgRef}
            viewBox="0 0 680 1050"
            style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
          >
            <PitchSVG />
            <ArrowLayer svgRef={svgRef} />
            <PlayerLayer svgRef={svgRef} onEditPlayer={openPlayerEditor} />
            <DrawingOverlay svgRef={svgRef} />
          </svg>
        </DndContext>

        {selectedPlayer && (
          <PlayerEditPopover
            player={selectedPlayer}
            svgRef={svgRef}
            onClose={closePlayerEditor}
          />
        )}
      </div>
    </div>
  )
}
