import { useBoardStore } from '@/store/boardStore'
import { ArrowTypes } from '@/components/controls/Controls'
import SelectionCard from '@/components/panels/SelectionCard'

/** Phone dock in flow under the pitch: the arrow types while drawing, and the selection card. */
export default function Dock() {
  const drawing = useBoardStore((s) => s.mode === 'draw-arrow')
  const hasSel = useBoardStore((s) => !!(s.selectedPlayerId || s.selectedArrowId))
  return (
    <div className="dock">
      {drawing && <ArrowTypes />}
      {(!drawing || hasSel) && <SelectionCard />}
    </div>
  )
}
