import { useStore } from 'zustand'
import { ArrowCounterClockwise, ArrowClockwise } from '@phosphor-icons/react'
import { useBoardStore } from '@/store/boardStore'
import ToolbarButton from './ToolbarButton'

export default function UndoRedoButtons() {
  const { undo, redo, pastStates, futureStates } = useStore(useBoardStore.temporal)
  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        icon={<ArrowCounterClockwise size={18} weight="light" />}
        title="Undo (Ctrl+Z)"
        ariaLabel="Undo"
        onClick={() => undo()}
        disabled={!canUndo}
      />
      <ToolbarButton
        icon={<ArrowClockwise size={18} weight="light" />}
        title="Redo (Ctrl+Shift+Z)"
        ariaLabel="Redo"
        onClick={() => redo()}
        disabled={!canRedo}
      />
    </div>
  )
}
