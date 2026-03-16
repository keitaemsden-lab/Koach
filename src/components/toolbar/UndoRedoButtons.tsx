import { useStore } from 'zustand'
import { useBoardStore } from '@/store/boardStore'

export default function UndoRedoButtons() {
  const { undo, redo, pastStates, futureStates } = useStore(useBoardStore.temporal)
  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  return (
    <div className="flex items-center gap-0.5">
      <button
        title="Undo (Ctrl+Z)"
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6" /><path d="M3 13C5 7 10 4 16 6s8 8 6 14" />
        </svg>
      </button>
      <button
        title="Redo (Ctrl+Shift+Z)"
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 7v6h-6" /><path d="M21 13C19 7 14 4 8 6S0 14 2 20" />
        </svg>
      </button>
    </div>
  )
}
