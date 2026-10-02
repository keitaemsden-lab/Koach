import { create } from 'zustand'

export type PlayPhase = 'idle' | 'running' | 'held' | 'returning'

type UIState = {
  toast: { msg: string, n: number } | null
  playPhase: PlayPhase
  /** URL shown when copying to the clipboard was blocked. */
  shareFallback: string | null
  confirm: 'clear-arrows' | 'reset-board' | null
  /** Bumped to ask the selection card to focus the name field (double-click a player). */
  focusName: number
  /** A player mid-drag, so arrows that start on them can follow live (portrait units). */
  liveDrag: { id: string, dx: number, dy: number } | null
  setLiveDrag: (d: UIState['liveDrag']) => void
  showToast: (msg: string) => void
  setPlayPhase: (p: PlayPhase) => void
  setShareFallback: (url: string | null) => void
  setConfirm: (c: UIState['confirm']) => void
  requestNameFocus: () => void
}

export const useUI = create<UIState>()((set) => ({
  toast: null,
  playPhase: 'idle',
  shareFallback: null,
  confirm: null,
  focusName: 0,
  liveDrag: null,
  setLiveDrag: (liveDrag) => set({ liveDrag }),
  showToast: (msg) => set((s) => ({ toast: { msg, n: (s.toast?.n ?? 0) + 1 } })),
  setPlayPhase: (playPhase) => set({ playPhase }),
  setShareFallback: (shareFallback) => set({ shareFallback }),
  setConfirm: (confirm) => set({ confirm }),
  requestNameFocus: () => set((s) => ({ focusName: s.focusName + 1 })),
}))

export const toast = (msg: string) => useUI.getState().showToast(msg)
