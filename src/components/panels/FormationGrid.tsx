import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useBoardStore } from '@/store/boardStore'
import { isPlaying } from '@/play/playMove'
import { toast } from '@/store/uiStore'
import Sheet from '@/components/ui/Sheet'
import type { FormationName } from '@/store/types'
import { FORMATION_NAMES } from '@/components/controls/actions'

/** Six shapes for one side. Picking one asks first (with the own-half option), then the players walk to it. */
export default function FormationGrid({ team, onApplied }: { team: 'home' | 'away', onApplied?: () => void }) {
  const current = useBoardStore((s) => (team === 'home' ? s.activeFormation : s.awayFormation))
  const loadFormation = useBoardStore((s) => s.loadFormation)
  const [pending, setPending] = useState<FormationName | null>(null)
  const [ownHalf, setOwnHalf] = useState(false)
  const side = team === 'home' ? 'Home' : 'Opposition'

  return (
    <>
      <div className={'fgrid ' + team} role="group" aria-label={`${side} shape`}>
        {FORMATION_NAMES.map((f) => (
          <button
            key={f}
            className="fbtn mono"
            aria-pressed={current === f}
            onClick={() => { if (!isPlaying()) setPending(f) }}
          >
            {f}
          </button>
        ))}
      </div>
      {pending && createPortal(
        <Sheet title={`Set ${side.toLowerCase()} to ${pending}`} onClose={() => setPending(null)} narrow closeLabel="Cancel">
          <p>{side} players move to a {pending}. Names and numbers stay with them, and Undo puts them back.</p>
          <label className="check">
            <input type="checkbox" checked={ownHalf} onChange={(e) => setOwnHalf(e.target.checked)} />
            Keep the shape in their own half
          </label>
          <div className="pair">
            <button
              className="btn solid"
              data-autofocus
              onClick={() => {
                loadFormation(pending, ownHalf, team)
                toast(`${side} now ${pending}`)
                setPending(null)
                onApplied?.()
              }}
            >
              Set {pending}
            </button>
          </div>
        </Sheet>,
        document.body,
      )}
    </>
  )
}
