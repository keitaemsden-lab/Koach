import { useBoardStore } from '@/store/boardStore'

export default function ModeToggle() {
  const mode    = useBoardStore((s) => s.mode)
  const setMode = useBoardStore((s) => s.setMode)

  return (
    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {(['select', 'draw-arrow'] as const).map((m) => (
        <button
          key={m}
          title={m === 'select' ? 'Select / Move (S)' : 'Draw Arrow (D)'}
          onClick={() => setMode(m)}
          className="px-3 py-1 text-xs font-medium transition-colors duration-150"
          style={{
            minWidth: 44, minHeight: 36,
            background: mode === m ? 'var(--accent)' : 'transparent',
            color: mode === m ? 'white' : 'var(--text-secondary)',
          }}
        >
          {m === 'select' ? 'Select' : 'Draw'}
        </button>
      ))}
    </div>
  )
}
