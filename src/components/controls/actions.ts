import { useStore } from 'zustand'
import { useBoardStore } from '@/store/boardStore'
import { useUI, toast } from '@/store/uiStore'
import { boardDom } from '@/play/boardDom'
import type { FormationName } from '@/store/types'

export const FORMATION_NAMES: FormationName[] = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '4-5-1']

export function useHistory() {
  const { undo, redo, pastStates, futureStates } = useStore(useBoardStore.temporal)
  const playing = useUI((s) => s.playPhase !== 'idle')
  return {
    undo: () => { if (!playing) undo() },
    redo: () => { if (!playing) redo() },
    canUndo: pastStates.length > 0 && !playing,
    canRedo: futureStates.length > 0 && !playing,
  }
}

export function askClearArrows() {
  if (!useBoardStore.getState().arrows.length) { toast('No arrows to clear'); return }
  useUI.getState().setConfirm('clear-arrows')
}

export function useDisplay() {
  const isDark = useBoardStore((s) => s.isDarkMode)
  const toggleDarkMode = useBoardStore((s) => s.toggleDarkMode)
  const setOrientationPref = useBoardStore((s) => s.setOrientationPref)
  return {
    themeLabel: isDark ? 'Day colours' : 'Night colours',
    toggleTheme: toggleDarkMode,
    /** Turn the pitch the other way from how it lies now. */
    rotate: () => setOrientationPref(boardDom.land ? 'portrait' : 'landscape'),
  }
}
