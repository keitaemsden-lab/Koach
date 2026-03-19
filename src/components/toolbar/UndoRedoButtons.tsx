import { useStore } from 'zustand'
import { ArrowCounterClockwise, ArrowClockwise } from '@phosphor-icons/react'
import { useBoardStore } from '@/store/boardStore'

export default function UndoRedoButtons() {
  const { undo, redo, pastStates, futureStates } = useStore(useBoardStore.temporal)
  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  return (
    <div className="flex items-center gap-0.5">
      <button
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
        disabled={!canUndo}
        onClick={() => undo()}
        className="flex items-center justify-center rounded-lg transition-colors duration-150"
        style={{
          width: 36, height: 36,
          background: 'transparent',
          color: canUndo ? 'var(--text-secondary)' : 'var(--border)',
          cursor: canUndo ? 'pointer' : 'not-allowed',
        }}
      >
        <ArrowCounterClockwise size={18} weight="light" />
      </button>
      <button
        title="Redo (Ctrl+Shift+Z)"
        aria-label="Redo"
        disabled={!canRedo}
        onClick={() => redo()}
        className="flex items-center justify-center rounded-lg transition-colors duration-150"
        style={{
          width: 36, height: 36,
          background: 'transparent',
          color: canRedo ? 'var(--text-secondary)' : 'var(--border)',
          cursor: canRedo ? 'pointer' : 'not-allowed',
        }}
      >
        <ArrowClockwise size={18} weight="light" />
      </button>
    </div>
  )
}
