import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import { useHistory } from './actions'
import { togglePlay } from '@/play/playMove'
import type { ArrowType } from '@/store/types'
import {
  MoveIcon, DrawIcon, PlayIcon, StopIcon, BackIcon, UndoIcon, RedoIcon, RunGlyph, PassGlyph, PressGlyph,
} from '@/components/ui/Icons'

export function ModeSeg() {
  const mode = useBoardStore((s) => s.mode)
  const setMode = useBoardStore((s) => s.setMode)
  return (
    <div className="seg" role="group" aria-label="Mode">
      <button className="tool" aria-pressed={mode === 'select'} onClick={() => setMode('select')} title="Move players (V)">
        <MoveIcon /><span>Move</span><kbd>V</kbd>
      </button>
      <button className="tool" aria-pressed={mode === 'draw-arrow'} onClick={() => setMode('draw-arrow')} title="Draw arrows (D)">
        <DrawIcon /><span>Draw</span><kbd>D</kbd>
      </button>
    </div>
  )
}

const TYPES: { t: ArrowType, label: string, glyph: () => React.JSX.Element }[] = [
  { t: 'run', label: 'Run', glyph: RunGlyph },
  { t: 'pass', label: 'Pass', glyph: PassGlyph },
  { t: 'press', label: 'Press', glyph: PressGlyph },
]
const INK_LABEL = { home: 'Home', away: 'Opp', neutral: 'Chalk' } as const

/** Run / pass / press, plus whose ink a free-standing arrow takes. Picking a type starts drawing. */
export function ArrowTypes() {
  const mode = useBoardStore((s) => s.mode)
  const arrowType = useBoardStore((s) => s.arrowType)
  const arrowTeam = useBoardStore((s) => s.arrowTeam)
  const setArrowType = useBoardStore((s) => s.setArrowType)
  const setMode = useBoardStore((s) => s.setMode)
  const cycleArrowTeam = useBoardStore((s) => s.cycleArrowTeam)
  const drawing = mode === 'draw-arrow'
  const inkColour = arrowTeam === 'home' ? 'var(--tele)' : arrowTeam === 'away' ? '#EEF2EA' : '#B9CBB8'
  return (
    <div className={'types' + (drawing ? '' : ' idle')} role="group" aria-label="Arrow type">
      {TYPES.map(({ t, label, glyph: G }) => (
        <button
          key={t}
          className="chip"
          aria-pressed={arrowType === t}
          onClick={() => { setArrowType(t); if (!drawing) setMode('draw-arrow') }}
        >
          <G />{label}
        </button>
      ))}
      <button
        className="chip"
        onClick={cycleArrowTeam}
        aria-label={`Ink for arrows not started on a player: ${INK_LABEL[arrowTeam]}. Tap to change.`}
        title="Ink for arrows that do not start on a player"
      >
        <span className="ink" style={{ background: inkColour }} aria-hidden="true" />{INK_LABEL[arrowTeam]}
      </button>
    </div>
  )
}

export function PlayButton({ variant }: { variant: 'tool' | 'tb' }) {
  const phase = useUI((s) => s.playPhase)
  const on = phase !== 'idle'
  const label = phase === 'running' || phase === 'returning' ? 'Stop' : phase === 'held' ? 'Back' : 'Play'
  const Icon = phase === 'held' ? BackIcon : on ? StopIcon : PlayIcon
  if (variant === 'tb') {
    return (
      <button className="tb play" aria-pressed={on} onClick={togglePlay} aria-label={on ? label : 'Play the move'}>
        <Icon /><span>{label}</span>
      </button>
    )
  }
  return (
    <button className="tool play" aria-pressed={on} onClick={togglePlay} title="Play the move (P)">
      <Icon /><span>{label}</span>{!on && <span className="sub">the move</span>}<kbd>P</kbd>
    </button>
  )
}

export function UndoButton({ variant }: { variant: 'tool' | 'tb' }) {
  const h = useHistory()
  return (
    <button className={variant} onClick={h.undo} disabled={!h.canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
      <UndoIcon /><span className="lbl">Undo</span>
    </button>
  )
}

export function RedoButton() {
  const h = useHistory()
  return (
    <button className="tool" onClick={h.redo} disabled={!h.canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
      <RedoIcon /><span className="lbl">Redo</span>
    </button>
  )
}
