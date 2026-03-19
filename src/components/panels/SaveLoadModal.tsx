import { useState, useEffect } from 'react'
import { useBoardStore } from '@/store/boardStore'
import type { SavedFormation } from '@/store/types'

export default function SaveLoadModal() {
  const isOpen           = useBoardStore((s) => s.isSaveLoadModalOpen)
  const toggleModal      = useBoardStore((s) => s.toggleSaveLoadModal)
  const saveToLocal      = useBoardStore((s) => s.saveToLocalStorage)
  const loadFromLocal    = useBoardStore((s) => s.loadFromLocalStorage)
  const deleteSave       = useBoardStore((s) => s.deleteSave)
  const listSaves        = useBoardStore((s) => s.listSaves)
  const clearArrows      = useBoardStore((s) => s.clearArrows)
  const clearBoard       = useBoardStore((s) => s.clearBoard)

  const [saveName, setSaveName] = useState('')
  const [saves, setSaves] = useState<SavedFormation[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => setSaves(listSaves()), 0)
    return () => clearTimeout(t)
  }, [isOpen, listSaves])

  if (!isOpen) return null

  function handleSave() {
    if (!saveName.trim()) return
    saveToLocal(saveName.trim())
    setSaves(listSaves())
    setSaveName('')
  }

  function handleLoad(name: string) {
    loadFromLocal(name)
    toggleModal()
  }

  function handleDelete(name: string) {
    deleteSave(name)
    setSaves(listSaves())
    setConfirmDelete(null)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.6)', animation: 'modal-bg-in 200ms ease' }}
      onClick={toggleModal}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col"
        style={{
          maxHeight: '70vh',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: 'DM Mono, monospace',
          animation: 'modal-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-medium text-sm">Saves</span>
          <button
            onClick={toggleModal}
            aria-label="Close"
            style={{ color: 'var(--text-secondary)', fontSize: 20, lineHeight: 1, cursor: 'pointer' }}
          >×</button>
        </div>

        {/* Save row */}
        <div className="flex gap-2 p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <input
            className="flex-1 rounded px-3 py-2 text-xs"
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
            placeholder="Save name..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); e.stopPropagation() }}
          />
          <button
            className="px-4 py-2 rounded text-xs font-medium"
            style={{ background: 'var(--accent)', color: 'white' }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            className="flex-1 px-3 py-2 rounded text-xs font-medium"
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
            onClick={() => {
              if (window.confirm('Clear all arrows? This cannot be undone.')) {
                clearArrows()
              }
            }}
          >
            Clear arrows
          </button>
          <button
            className="flex-1 px-3 py-2 rounded text-xs font-medium"
            style={{ background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer' }}
            onClick={() => {
              if (window.confirm('Reset board to default 4-3-3? All changes will be lost.')) {
                clearBoard()
                toggleModal()
              }
            }}
          >
            Reset board
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {saves.length === 0 && (
            <p className="p-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>No saves yet</p>
          )}
          {saves.slice().reverse().map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-lg p-3 mb-1"
              style={{ background: 'var(--bg-app)' }}
            >
              <div>
                <p className="text-xs font-medium">{s.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(s.savedAt).toLocaleDateString()} {new Date(s.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  className="px-2 py-1 rounded text-xs"
                  style={{ background: 'var(--accent)', color: 'white' }}
                  onClick={() => handleLoad(s.name)}
                >
                  Load
                </button>
                {confirmDelete === s.name ? (
                  <button
                    className="px-2 py-1 rounded text-xs"
                    style={{ background: '#dc2626', color: 'white' }}
                    onClick={() => handleDelete(s.name)}
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    className="px-2 py-1 rounded text-xs"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    onClick={() => setConfirmDelete(s.name)}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
