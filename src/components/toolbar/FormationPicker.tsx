import { useState } from 'react'
import { useBoardStore } from '@/store/boardStore'
import type { FormationName } from '@/store/types'

const FORMATIONS: FormationName[] = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '4-5-1']

export default function FormationPicker() {
  const activeFormation = useBoardStore((s) => s.activeFormation)
  const loadFormation   = useBoardStore((s) => s.loadFormation)
  const players         = useBoardStore((s) => s.players)
  const [pending, setPending] = useState<FormationName | null>(null)

  function handleSelect(name: FormationName) {
    if (players.length > 0 && name !== activeFormation) {
      setPending(name)
    } else {
      loadFormation(name)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={activeFormation ?? ''}
        onChange={(e) => handleSelect(e.target.value as FormationName)}
        className="rounded px-2 py-1 text-xs font-medium"
        style={{
          height: 36,
          background: 'var(--bg-app)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: 'DM Mono, monospace',
          cursor: 'pointer',
        }}
        title="Load formation"
      >
        <option value="" disabled>Formation</option>
        {FORMATIONS.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {/* Confirmation dialog */}
      {pending && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="rounded-xl p-5 shadow-2xl max-w-xs w-full mx-4 text-sm"
            style={{
              background: 'var(--bg-toolbar)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'DM Mono, monospace',
            }}
          >
            <p className="mb-4">Load <strong>{pending}</strong>? This will reset home team positions.</p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ background: 'var(--accent)', color: 'white' }}
                onClick={() => { loadFormation(pending!); setPending(null) }}
              >
                Load
              </button>
              <button
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onClick={() => setPending(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
