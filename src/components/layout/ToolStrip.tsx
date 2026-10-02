import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import { askClearArrows } from '@/components/controls/actions'
import { ModeSeg, ArrowTypes, PlayButton, UndoButton, RedoButton } from '@/components/controls/Controls'

/** Desktop tools above the pitch. Nothing floats over the grass. */
export default function ToolStrip() {
  const arrows = useBoardStore((s) => s.arrows.length)
  const playing = useUI((s) => s.playPhase !== 'idle')
  return (
    <div className="tools desk" role="toolbar" aria-label="Board tools">
      <ModeSeg />
      <ArrowTypes />
      <PlayButton variant="tool" />
      <div className="seg end">
        <UndoButton variant="tool" />
        <RedoButton />
        <button className="tool" onClick={askClearArrows} disabled={!arrows || playing}>Clear arrows</button>
      </div>
    </div>
  )
}
