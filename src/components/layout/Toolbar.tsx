import type { RefObject } from 'react'
import ModeToggle from '@/components/toolbar/ModeToggle'
import ArrowTypePicker from '@/components/toolbar/ArrowTypePicker'
import FormationPicker from '@/components/toolbar/FormationPicker'
import TeamColourPicker from '@/components/toolbar/TeamColourPicker'
import UndoRedoButtons from '@/components/toolbar/UndoRedoButtons'
import ExportButton from '@/components/toolbar/ExportButton'
import { useBoardStore } from '@/store/boardStore'

interface ToolbarProps {
  boardRef: RefObject<HTMLDivElement | null>
}

export default function Toolbar({ boardRef }: ToolbarProps) {
  const toggleNotesPanel    = useBoardStore((s) => s.toggleNotesPanel)
  const isNotesPanelOpen    = useBoardStore((s) => s.isNotesPanelOpen)
  const toggleSaveLoadModal = useBoardStore((s) => s.toggleSaveLoadModal)

  return (
    <div
      className="flex items-center gap-2 px-3 overflow-x-auto flex-shrink-0"
      style={{
        height: 52,
        backgroundColor: 'var(--bg-toolbar)',
      }}
    >
      <ModeToggle />

      <div className="w-px self-stretch my-1.5" style={{ background: 'var(--border)' }} />

      <ArrowTypePicker />

      <FormationPicker />

      <div className="w-px self-stretch my-1.5" style={{ background: 'var(--border)' }} />

      <TeamColourPicker />

      <div className="w-px self-stretch my-1.5" style={{ background: 'var(--border)' }} />

      <UndoRedoButtons />

      <div className="ml-auto flex items-center gap-1">
        {/* Notes toggle */}
        <button
          title="Toggle notes (N)"
          aria-label="Toggle notes panel"
          onClick={toggleNotesPanel}
          className="flex items-center justify-center rounded-lg transition-colors duration-150"
          style={{
            width: 36, height: 36,
            background: isNotesPanelOpen ? 'var(--accent)' : 'transparent',
            color: isNotesPanelOpen ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </button>

        {/* Save/Load */}
        <button
          title="Save / Load"
          aria-label="Save / Load"
          onClick={toggleSaveLoadModal}
          className="flex items-center justify-center rounded-lg transition-colors duration-150"
          style={{
            width: 36, height: 36,
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </button>

        <ExportButton boardRef={boardRef} />
      </div>
    </div>
  )
}
