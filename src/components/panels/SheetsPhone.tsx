import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import Sheet from '@/components/ui/Sheet'
import FormationGrid from './FormationGrid'
import Kits from './Kits'
import { useDisplay, askClearArrows, useHistory } from '@/components/controls/actions'
import { shareBoard } from '@/utils/share'
import { exportToPNG } from '@/utils/export'

export function ShapeSheet() {
  const open = useBoardStore((s) => s.isShapeOpen)
  const setOpen = useBoardStore((s) => s.setShapeOpen)
  if (!open) return null
  const close = () => setOpen(false)
  return (
    <Sheet title="Shape" onClose={close}>
      <h3>Home</h3>
      <FormationGrid team="home" onApplied={close} />
      <h3>Opposition</h3>
      <FormationGrid team="away" onApplied={close} />
    </Sheet>
  )
}

export function MoreSheet() {
  const open = useBoardStore((s) => s.isMoreOpen)
  const setOpen = useBoardStore((s) => s.setMoreOpen)
  const arrows = useBoardStore((s) => s.arrows.length)
  const notes = useBoardStore((s) => s.notes.length)
  const h = useHistory()
  const d = useDisplay()
  const playing = useUI((s) => s.playPhase !== 'idle')
  if (!open) return null
  const close = () => setOpen(false)
  const then = (fn: () => void) => () => { close(); fn() }
  return (
    <Sheet title="Board" onClose={close}>
      <div className="mgrid">
        <button className="row" onClick={h.redo} disabled={!h.canRedo}>Redo</button>
        <button className="row" onClick={then(() => useBoardStore.getState().setNotesPanelOpen(true))}>Coaching notes <span className="mono">{notes} / 1000</span></button>
        <button className="row" onClick={then(() => void shareBoard())}>Share link</button>
        <button className="row" onClick={then(() => void exportToPNG())}>Export PNG</button>
        <button className="row" onClick={then(() => useBoardStore.setState({ isSaveLoadModalOpen: true }))}>Save or open a board</button>
        <button className="row" disabled={!arrows || playing} onClick={then(askClearArrows)}>Clear arrows</button>
        <button className="row" disabled={playing} onClick={then(() => useUI.getState().setConfirm('reset-board'))}>Reset board</button>
        <button className="row" onClick={then(d.rotate)}>Rotate pitch</button>
        <button className="row" onClick={d.toggleTheme}>{d.themeLabel}</button>
      </div>
      <h3>Kits</h3>
      <Kits />
    </Sheet>
  )
}
