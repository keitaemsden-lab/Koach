import { useBoardStore } from '@/store/boardStore'
import { PlayButton, UndoButton } from '@/components/controls/Controls'
import { MoveIcon, DrawIcon, ShapeIcon, MoreIcon } from '@/components/ui/Icons'

/** Six 60 px tools under the pitch on phones; Shape and More open sheets, so nothing covers the grass. */
export default function PhoneBar() {
  const mode = useBoardStore((s) => s.mode)
  const setMode = useBoardStore((s) => s.setMode)
  const setShapeOpen = useBoardStore((s) => s.setShapeOpen)
  const setMoreOpen = useBoardStore((s) => s.setMoreOpen)
  return (
    <nav className="bar" aria-label="Board tools">
      <button className="tb" aria-pressed={mode === 'select'} onClick={() => setMode('select')}><MoveIcon /><span>Move</span></button>
      <button className="tb" aria-pressed={mode === 'draw-arrow'} onClick={() => setMode('draw-arrow')}><DrawIcon /><span>Draw</span></button>
      <PlayButton variant="tb" />
      <button className="tb" aria-haspopup="dialog" onClick={() => setShapeOpen(true)}><ShapeIcon /><span>Shape</span></button>
      <UndoButton variant="tb" />
      <button className="tb" aria-haspopup="dialog" onClick={() => setMoreOpen(true)}><MoreIcon /><span>More</span></button>
    </nav>
  )
}
