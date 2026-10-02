import { useState, useEffect } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { useUI, toast } from '@/store/uiStore'
import type { SavedFormation } from '@/store/types'
import Sheet from '@/components/ui/Sheet'
import { askClearArrows } from '@/components/controls/actions'

/** Saved boards: save under a name (the title by default), open, delete, plus clear and reset. */
export default function SaveLoadModal() {
  const isOpen        = useBoardStore((s) => s.isSaveLoadModalOpen)
  const toggleModal   = useBoardStore((s) => s.toggleSaveLoadModal)
  const saveToLocal   = useBoardStore((s) => s.saveToLocalStorage)
  const loadFromLocal = useBoardStore((s) => s.loadFromLocalStorage)
  const deleteSave    = useBoardStore((s) => s.deleteSave)
  const listSaves     = useBoardStore((s) => s.listSaves)
  const title         = useBoardStore((s) => s.title)

  const [saveName, setSaveName] = useState('')
  const [saves, setSaves] = useState<SavedFormation[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => { setSaves(listSaves()); setSaveName(useBoardStore.getState().title) }, 0)
    return () => clearTimeout(t)
  }, [isOpen, listSaves])

  if (!isOpen) return null

  function handleSave() {
    const name = saveName.trim() || title
    if (!name) return
    saveToLocal(name)
    setSaves(listSaves())
    toast(`Saved "${name}"`)
  }

  function handleLoad(name: string) {
    loadFromLocal(name)
    toggleModal()
    toast(`Opened "${name}"`)
  }

  function handleDelete(name: string) {
    deleteSave(name)
    setSaves(listSaves())
    setConfirmDelete(null)
  }

  return (
    <Sheet title="Saves" heading="Saved boards" onClose={toggleModal}>
      <div className="saverow">
        <label className="sr-only" htmlFor="save-name">Save name</label>
        <input
          id="save-name"
          placeholder="Name this board"
          aria-label="Save name"
          data-autofocus
          maxLength={80}
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
        />
        <button className="btn solid" onClick={handleSave}>Save</button>
      </div>

      <ul className="boardlist">
        {saves.length === 0 && <li className="empty">No saved boards yet. Save this one to start a list.</li>}
        {saves.slice().reverse().map((s) => {
          const d = new Date(s.savedAt)
          return (
            <li key={s.name}>
              <span className="bn">{s.name}</span>
              <span className="bd mono">
                {d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} {d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
              </span>
              <button className="btn b-open" onClick={() => handleLoad(s.name)}>Open</button>
              {confirmDelete === s.name ? (
                <button className="btn danger b-del" onClick={() => handleDelete(s.name)}>Confirm</button>
              ) : (
                <button className="btn quiet b-del" aria-label={`Delete ${s.name}`} onClick={() => setConfirmDelete(s.name)}>Delete</button>
              )}
            </li>
          )
        })}
      </ul>

      <div className="pair">
        <button className="btn" onClick={askClearArrows}>Clear arrows</button>
        <button className="btn danger" onClick={() => useUI.getState().setConfirm('reset-board')}>Reset board</button>
      </div>
    </Sheet>
  )
}
