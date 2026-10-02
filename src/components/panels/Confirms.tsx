import { useBoardStore } from '@/store/boardStore'
import { useUI, toast } from '@/store/uiStore'
import Sheet from '@/components/ui/Sheet'

/** Clear arrows and Reset board ask first. Both can be undone, and the copy says so. */
export default function Confirms() {
  const confirm = useUI((s) => s.confirm)
  const setConfirm = useUI((s) => s.setConfirm)
  const arrows = useBoardStore((s) => s.arrows.length)
  if (!confirm) return null
  const close = () => setConfirm(null)
  if (confirm === 'clear-arrows') {
    return (
      <Sheet title="Clear arrows" onClose={close} narrow closeLabel="Cancel">
        <p>Clear all {arrows} {arrows === 1 ? 'arrow' : 'arrows'}? Undo brings them back.</p>
        <div className="pair">
          <button className="btn solid" data-autofocus onClick={() => {
            useBoardStore.getState().clearArrows(); close(); toast('Arrows cleared. Undo brings them back.')
          }}>Clear arrows</button>
        </div>
      </Sheet>
    )
  }
  return (
    <Sheet title="Reset board" onClose={close} narrow closeLabel="Cancel">
      <p>Reset to a blank 4-3-3 against 4-3-3? Arrows, names, title and notes go. Undo brings them back.</p>
      <div className="pair">
        <button className="btn danger solid" data-autofocus onClick={() => {
          useBoardStore.getState().clearBoard()
          useBoardStore.setState({ isSaveLoadModalOpen: false, isMoreOpen: false })
          close(); toast('Board reset. Undo brings it back.')
        }}>Reset board</button>
      </div>
    </Sheet>
  )
}
