import { useBoardStore } from '@/store/boardStore'
import type { ArrowType, ArrowStyle } from '@/store/types'

export default function ArrowTypePicker() {
  const mode       = useBoardStore((s) => s.mode)
  const arrowType  = useBoardStore((s) => s.arrowType)
  const arrowStyle = useBoardStore((s) => s.arrowStyle)
  const setArrowType  = useBoardStore((s) => s.setArrowType)
  const setArrowStyle = useBoardStore((s) => s.setArrowStyle)

  if (mode !== 'draw-arrow') return null

  return (
    <div className="flex items-center gap-1">
      {/* Arrow type */}
      <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {(['run', 'pass', 'press'] as ArrowType[]).map((t) => (
          <button
            key={t}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
            onClick={() => setArrowType(t)}
            className="px-2 py-1 text-xs font-medium capitalize transition-colors duration-150"
            style={{
              minWidth: 44, minHeight: 36,
              background: arrowType === t ? 'var(--accent)' : 'transparent',
              color: arrowType === t ? 'white' : 'var(--text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Arrow style */}
      <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {(['straight', 'curved'] as ArrowStyle[]).map((s) => (
          <button
            key={s}
            title={s.charAt(0).toUpperCase() + s.slice(1)}
            onClick={() => setArrowStyle(s)}
            className="px-2 py-1 text-xs font-medium capitalize transition-colors duration-150"
            style={{
              minWidth: 44, minHeight: 36,
              background: arrowStyle === s ? 'var(--accent)' : 'transparent',
              color: arrowStyle === s ? 'white' : 'var(--text-secondary)',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
