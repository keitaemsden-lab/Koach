import { CursorClick, PencilSimple } from '@phosphor-icons/react'
import { useBoardStore } from '@/store/boardStore'

export default function ModeToggle() {
  const mode    = useBoardStore((s) => s.mode)
  const setMode = useBoardStore((s) => s.setMode)

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '4px 12px',
    borderRadius: 999,
    background: isActive ? 'var(--accent)' : 'transparent',
    color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    transition: 'background 150ms ease, color 150ms ease',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
  })

  return (
    <div className="flex items-center gap-0.5">
      <button
        title="Select / Move (S)"
        aria-label="Select / Move"
        onClick={() => setMode('select')}
        style={buttonStyle(mode === 'select')}
      >
        <CursorClick size={18} weight="light" />
        <span className="hidden sm:inline">Select</span>
      </button>
      <button
        title="Draw Arrow (D)"
        aria-label="Draw Arrow"
        onClick={() => setMode('draw-arrow')}
        style={buttonStyle(mode === 'draw-arrow')}
      >
        <PencilSimple size={18} weight="light" />
        <span className="hidden sm:inline">Draw</span>
      </button>
    </div>
  )
}
