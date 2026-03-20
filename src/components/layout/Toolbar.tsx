import type { RefObject } from 'react'
import { NoteBlank, FloppyDisk, ArrowsHorizontal } from '@phosphor-icons/react'
import ModeToggle from '@/components/toolbar/ModeToggle'
import ArrowTypePicker from '@/components/toolbar/ArrowTypePicker'
import FormationPicker from '@/components/toolbar/FormationPicker'
import TeamColourPicker from '@/components/toolbar/TeamColourPicker'
import UndoRedoButtons from '@/components/toolbar/UndoRedoButtons'
import ExportButton from '@/components/toolbar/ExportButton'
import ToolbarButton from '@/components/toolbar/ToolbarButton'
import { useBoardStore } from '@/store/boardStore'

interface ToolbarProps {
  boardRef: RefObject<HTMLDivElement | null>
}

export default function Toolbar({ boardRef }: ToolbarProps) {
  const toggleNotesPanel       = useBoardStore((s) => s.toggleNotesPanel)
  const isNotesPanelOpen       = useBoardStore((s) => s.isNotesPanelOpen)
  const toggleSaveLoadModal    = useBoardStore((s) => s.toggleSaveLoadModal)
  const pitchOrientation       = useBoardStore((s) => s.pitchOrientation)
  const togglePitchOrientation = useBoardStore((s) => s.togglePitchOrientation)

  return (
    <div
      className="toolbar-pill absolute z-10 left-1/2 -translate-x-1/2 bottom-5 flex items-center gap-1.5 px-3 [&::-webkit-scrollbar]:hidden"
      style={{
        height: 48,
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
        background: 'rgba(15, 23, 36, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <ModeToggle />

      <div className="w-px self-stretch my-1.5" style={{ background: 'rgba(255,255,255,0.12)' }} />

      <ArrowTypePicker />

      <FormationPicker />

      <div className="w-px self-stretch my-1.5" style={{ background: 'rgba(255,255,255,0.12)' }} />

      <TeamColourPicker />

      <div className="w-px self-stretch my-1.5" style={{ background: 'rgba(255,255,255,0.12)' }} />

      <UndoRedoButtons />

      <ToolbarButton
        className="hidden md:flex"
        icon={<ArrowsHorizontal size={18} weight="light" />}
        title={pitchOrientation === 'portrait' ? 'Switch to landscape' : 'Switch to portrait'}
        ariaLabel="Toggle pitch orientation"
        onClick={togglePitchOrientation}
      />

      <div className="ml-auto flex items-center gap-1">
        {/* Notes toggle */}
        <ToolbarButton
          icon={<NoteBlank size={18} weight="light" />}
          title="Toggle notes (N)"
          ariaLabel="Toggle notes panel"
          onClick={toggleNotesPanel}
          isActive={isNotesPanelOpen}
        />

        {/* Save/Load */}
        <ToolbarButton
          icon={<FloppyDisk size={18} weight="light" />}
          title="Save / Load"
          ariaLabel="Save / Load"
          onClick={toggleSaveLoadModal}
        />

        <ExportButton boardRef={boardRef} />
      </div>
    </div>
  )
}
