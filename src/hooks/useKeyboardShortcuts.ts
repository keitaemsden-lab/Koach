import { useEffect } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { isPlaying, togglePlay, stopPlayback } from '@/play/playMove'
import { DESK_QUERY } from './useMedia'

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

      const key = e.key.toLowerCase()
      if (isCtrl && !e.shiftKey && key === 'z') {
        e.preventDefault()
        if (!isPlaying()) useBoardStore.temporal.getState().undo()
        return
      }
      if ((isCtrl && e.shiftKey && key === 'z') || (isCtrl && key === 'y')) {
        e.preventDefault()
        if (!isPlaying()) useBoardStore.temporal.getState().redo()
        return
      }
      if (e.key === 'Escape') {
        if (isPlaying()) { stopPlayback(); return }
        setMode('select')
        setDrawingState(null)
        selectPlayer(null)
        selectArrow(null)
        return
      }
      if (isCtrl || e.altKey) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sid = useBoardStore.getState().selectedArrowId
        if (sid && !isPlaying()) { removeArrow(sid); return }
      }
      if (key === 'd') { setMode('draw-arrow'); return }
      if (key === 's' || key === 'v' || key === 'm') { setMode('select'); return }
      if (key === 'p') { e.preventDefault(); togglePlay(); return }
      if (key === 'n') {
        const notes = window.matchMedia?.(DESK_QUERY).matches ? document.getElementById('notes-d') : null
        if (notes) { e.preventDefault(); notes.focus() } else toggleNotesPanel()
        return
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [setMode, setDrawingState, selectPlayer, selectArrow, removeArrow, toggleNotesPanel])
}
