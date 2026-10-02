import { useBoardStore } from '@/store/boardStore'
import Sheet from '@/components/ui/Sheet'

export const MAX_CHARS = 1000

export function NotesField({ id, autoFocus }: { id: string, autoFocus?: boolean }) {
  const notes = useBoardStore((s) => s.notes)
  const setNotes = useBoardStore((s) => s.setNotes)
  return (
    <textarea
      id={id}
      className="notes"
      maxLength={MAX_CHARS}
      rows={6}
      data-autofocus={autoFocus || undefined}
      placeholder="What should the squad remember about this move?"
      value={notes}
      onChange={(e) => setNotes(e.target.value.slice(0, MAX_CHARS))}
    />
  )
}

export function NotesCount() {
  const n = useBoardStore((s) => s.notes.length)
  return <span className="count mono">{n} / {MAX_CHARS}</span>
}

/** Phone notes: a sheet, mounted only while open so nothing hidden stays focusable. */
export default function NotesSheet() {
  const isOpen = useBoardStore((s) => s.isNotesPanelOpen)
  const setOpen = useBoardStore((s) => s.setNotesPanelOpen)
  if (!isOpen) return null
  return (
    <Sheet
      title="Coaching notes"
      heading={<label htmlFor="notes-m">Coaching notes</label>}
      onClose={() => setOpen(false)}
      closeLabel="Done"
    >
      <NotesField id="notes-m" autoFocus />
      <p className="count mono" style={{ marginTop: 8, marginBottom: 0 }}><NotesCount /></p>
    </Sheet>
  )
}
