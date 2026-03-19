import { useBoardStore } from '@/store/boardStore'

const MAX_CHARS = 1000

export default function NotesPanel() {
  const isOpen    = useBoardStore((s) => s.isNotesPanelOpen)
  const notes     = useBoardStore((s) => s.notes)
  const setNotes  = useBoardStore((s) => s.setNotes)

  return (
    <>
      {/* Desktop: side panel */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: isOpen ? 320 : 0,
          transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'var(--bg-panel)',
          borderLeft: isOpen ? '1px solid var(--border)' : 'none',
        }}
      >
        {isOpen && <NotesPanelContent notes={notes} setNotes={setNotes} />}
      </aside>

      {/* Mobile: bottom sheet */}
      <div
        className="md:hidden fixed inset-x-0 bottom-0 z-50"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'var(--bg-panel)',
          borderTop: '1px solid var(--border)',
          maxHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'calc(56px + env(safe-area-inset-bottom) + 8px)',
        }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
        </div>
        <NotesPanelContent notes={notes} setNotes={setNotes} />
      </div>
    </>
  )
}

function NotesPanelContent({ notes, setNotes }: { notes: string; setNotes: (n: string) => void }) {
  return (
    <div className="flex flex-col h-full p-4">
      <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>
        TACTICAL NOTES
      </p>
      <textarea
        className="flex-1 resize-none outline-none text-xs leading-relaxed"
        style={{
          background: 'transparent',
          color: 'var(--text-primary)',
          fontFamily: 'DM Mono, monospace',
          fontSize: 13,
          border: 'none',
          minHeight: 120,
        }}
        placeholder="Add tactical notes here..."
        maxLength={MAX_CHARS}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <p className="text-right mt-1" style={{ color: 'var(--text-secondary)', fontSize: 10, fontFamily: 'DM Mono, monospace' }}>
        {notes.length} / {MAX_CHARS}
      </p>
    </div>
  )
}
