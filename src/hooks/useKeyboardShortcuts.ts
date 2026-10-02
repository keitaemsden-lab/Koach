import { useEffect } from 'react'
import { useBoardStore } from '@/store/boardStore'

export function useKeyboardShortcuts() {
  const setMode         = useBoardStore((s) => s.setMode)
  const setDrawingState = useBoardStore((s) => s.setDrawingState)
  const selectPlayer    = useBoardStore((s) => s.selectPlayer)
  const selectArrow     = useBoardStore((s) => s.selectArrow)
  const removeArrow     = useBoardStore((s) => s.removeArrow)
  const toggleNotesPanel = useBoardStore((s) => s.toggleNotesPanel)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isCtrl = e.ctrlKey || e.metaKey
      const target = e.target as HTMLElement | null
      const tag = target?.tagName

      // Don't intercept shortcuts when typing in inputs
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (target?.isContentEditable) return
      // Dialogs own their keys (Escape, Tab); board shortcuts stay out of them
      if (target?.closest?.('[role="dialog"]')) return

      if (isCtrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useBoardStore.temporal.getState().undo()
        return
      }
      if ((isCtrl && e.shiftKey && e.key === 'z') || (isCtrl && e.key === 'y')) {
        e.preventDefault()
        useBoardStore.temporal.getState().redo()
        return
      }
      if (e.key === 'Escape') {
        setMode('select')
        setDrawingState(null)
        selectPlayer(null)
        selectArrow(null)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sid = useBoardStore.getState().selectedArrowId
        if (sid) { removeArrow(sid); return }
      }
      if (!isCtrl && e.key === 'd') { setMode('draw-arrow'); return }
      if (!isCtrl && !e.altKey && (e.key === 'n' || e.key === 'N')) { toggleNotesPanel(); return }
      if (!isCtrl && e.key === 's') { setMode('select'); return }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [setMode, setDrawingState, selectPlayer, selectArrow, removeArrow, toggleNotesPanel])
}
