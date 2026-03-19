import { useBoardStore } from '@/store/boardStore'
import type { ArrowType, ArrowStyle } from '@/store/types'

type ArrowTeam = 'home' | 'away' | 'neutral'

const pillButtonStyle = (isActive: boolean): React.CSSProperties => ({
  minWidth: 44,
  minHeight: 36,
  padding: '4px 10px',
  borderRadius: 999,
  background: isActive ? 'var(--accent)' : 'transparent',
  color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
  transition: 'background 150ms ease, color 150ms ease',
})

export default function ArrowTypePicker() {
  const mode       = useBoardStore((s) => s.mode)
  const arrowType  = useBoardStore((s) => s.arrowType)
  const arrowStyle = useBoardStore((s) => s.arrowStyle)
  const arrowTeam  = useBoardStore((s) => s.arrowTeam)
  const homeColour = useBoardStore((s) => s.homeColour)
  const awayColour = useBoardStore((s) => s.awayColour)
  const setArrowType  = useBoardStore((s) => s.setArrowType)
  const setArrowStyle = useBoardStore((s) => s.setArrowStyle)
  const setArrowTeam  = useBoardStore((s) => s.setArrowTeam)

  const TEAM_COLOURS: Record<ArrowTeam, string> = {
    home:    homeColour,
    away:    awayColour,
    neutral: '#ffffff',
  }

  if (mode !== 'draw-arrow') return null

  return (
    <div className="flex items-center gap-1">
      {/* Arrow type */}
      <div className="flex items-center gap-0.5">
        {(['run', 'pass', 'press'] as ArrowType[]).map((t) => (
          <button
            key={t}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
            onClick={() => setArrowType(t)}
            style={pillButtonStyle(arrowType === t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Arrow style */}
      <div className="flex items-center gap-0.5">
        {(['straight', 'curved'] as ArrowStyle[]).map((s) => (
          <button
            key={s}
            title={s.charAt(0).toUpperCase() + s.slice(1)}
            aria-label={s.charAt(0).toUpperCase() + s.slice(1) + ' arrow'}
            onClick={() => setArrowStyle(s)}
            style={pillButtonStyle(arrowStyle === s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Arrow team colour dots */}
      <div className="flex items-center gap-1 px-1">
        {(['home', 'away', 'neutral'] as ArrowTeam[]).map((t) => (
          <button
            key={t}
            title={`Arrow colour: ${t}`}
            aria-label={`Arrow colour ${t}`}
            onClick={() => setArrowTeam(t)}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: TEAM_COLOURS[t],
              border: arrowTeam === t ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
