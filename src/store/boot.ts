import { useBoardStore, SESSION_KEY } from './boardStore'
import { demoBoard } from './demo'

/** Open the shared board, else the last session, else (first visit) a worked example move. */
export function loadInitialBoard() {
  if (window.location.hash.startsWith('#state=')) return
  let had = false
  try { had = !!localStorage.getItem(SESSION_KEY) } catch { /* ignore */ }
  if (had) useBoardStore.getState().loadLastSession()
  else useBoardStore.setState(demoBoard())
  // opening a board is not an undoable step
  useBoardStore.temporal.getState().clear()
}

