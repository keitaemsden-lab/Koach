import { create } from 'zustand'
import { temporal } from 'zundo'
import type {
  BoardStore, BoardState, Player, SerializableState, SavedFormation,
} from './types'
import { FORMATIONS } from './formations'

const STORAGE_KEY = 'tactic-board:saves'
const SESSION_KEY = 'tactic-board:last-session'
const DARK_KEY    = 'tactic-board:dark-mode'

function applyDark(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
}

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem(DARK_KEY)
    if (stored !== null) return stored === 'true'
  } catch { /* ignore */ }
  return typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
}

function createInitialPlayers(): Player[] {
  const positions = FORMATIONS['4-3-3']
  const home: Player[] = positions.map((fp, i) => ({
    id: crypto.randomUUID(),
    team: 'home',
    position: fp.position,
    name: `#${i + 1}`,
    x: fp.x,
    y: fp.y,
  }))
  const away: Player[] = positions.map((fp, i) => ({
    id: crypto.randomUUID(),
    team: 'away',
    position: fp.position,
    name: `#${i + 1}`,
    x: 680 - fp.x,
    y: 1050 - fp.y,
  }))
  return [...home, ...away]
}

const initialDark = getInitialDark()
applyDark(initialDark)

const initialState: BoardState = {
  mode: 'select',
  arrowType: 'run',
  arrowStyle: 'straight',
  players: createInitialPlayers(),
  arrows: [],
  notes: '',
  homeColour: '#2563eb',
  awayColour: '#dc2626',
  selectedPlayerId: null,
  selectedArrowId: null,
  isDarkMode: initialDark,
  isNotesPanelOpen: false,
  isSaveLoadModalOpen: false,
  drawingState: null,
  activeFormation: '4-3-3',
}

export const useBoardStore = create<BoardStore>()(
  temporal(
    (set, get) => ({
      ...initialState,

      setMode: (mode) => set({ mode, drawingState: null }),
      setArrowType: (arrowType) => set({ arrowType }),
      setArrowStyle: (arrowStyle) => set({ arrowStyle }),

      movePlayer: (id, x, y) =>
        set((s) => ({ players: s.players.map((p) => p.id === id ? { ...p, x, y } : p) })),

      updatePlayer: (id, patch) =>
        set((s) => ({ players: s.players.map((p) => p.id === id ? { ...p, ...patch } : p) })),

      removePlayer: (id) =>
        set((s) => ({
          players: s.players.filter((p) => p.id !== id),
          selectedPlayerId: s.selectedPlayerId === id ? null : s.selectedPlayerId,
        })),

      addArrow: (arrow) =>
        set((s) => ({ arrows: [...s.arrows, { ...arrow, id: crypto.randomUUID() }] })),

      updateArrowControl: (id, control) =>
        set((s) => ({ arrows: s.arrows.map((a) => a.id === id ? { ...a, control } : a) })),

      removeArrow: (id) =>
        set((s) => ({
          arrows: s.arrows.filter((a) => a.id !== id),
          selectedArrowId: s.selectedArrowId === id ? null : s.selectedArrowId,
        })),

      setDrawingState: (drawingState) => set({ drawingState }),

      selectPlayer: (id) => set({ selectedPlayerId: id, selectedArrowId: null }),
      selectArrow:  (id) => set({ selectedArrowId: id, selectedPlayerId: null }),

      loadFormation: (name) => {
        const positions = FORMATIONS[name]
        if (!positions) return
        set((s) => {
          const homePlayers = s.players.filter((p) => p.team === 'home')
          const awayPlayers = s.players.filter((p) => p.team === 'away')
          const newHome: Player[] = positions.map((fp, i) => ({
            id: homePlayers[i]?.id ?? crypto.randomUUID(),
            team: 'home',
            position: fp.position,
            name: homePlayers[i]?.name ?? `#${i + 1}`,
            x: fp.x,
            y: fp.y,
          }))
          return { players: [...newHome, ...awayPlayers], activeFormation: name }
        })
      },

      setHomeColour: (homeColour) => set({ homeColour }),
      setAwayColour: (awayColour) => set({ awayColour }),
      setNotes: (notes) => set({ notes }),

      toggleDarkMode: () => {
        const isDark = !get().isDarkMode
        applyDark(isDark)
        try { localStorage.setItem(DARK_KEY, String(isDark)) } catch { /* ignore */ }
        set({ isDarkMode: isDark })
      },

      toggleNotesPanel:    () => set((s) => ({ isNotesPanelOpen: !s.isNotesPanelOpen })),
      toggleSaveLoadModal: () => set((s) => ({ isSaveLoadModalOpen: !s.isSaveLoadModalOpen })),

      saveToLocalStorage: (name) => {
        const s = get()
        const saves = s.listSaves()
        const newSave: SavedFormation = {
          name,
          savedAt: Date.now(),
          state: {
            players: s.players, arrows: s.arrows, notes: s.notes,
            homeColour: s.homeColour, awayColour: s.awayColour,
          },
        }
        const idx = saves.findIndex((sv) => sv.name === name)
        if (idx >= 0) saves[idx] = newSave; else saves.push(newSave)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saves.slice(-20))) } catch { /* ignore */ }
      },

      loadFromLocalStorage: (name) => {
        const save = get().listSaves().find((s) => s.name === name)
        if (!save) return
        set({
          players: save.state.players, arrows: save.state.arrows,
          notes: save.state.notes, homeColour: save.state.homeColour,
          awayColour: save.state.awayColour,
        })
      },

      deleteSave: (name) => {
        const saves = get().listSaves().filter((s) => s.name !== name)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saves)) } catch { /* ignore */ }
      },

      listSaves: (): SavedFormation[] => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          return raw ? (JSON.parse(raw) as SavedFormation[]) : []
        } catch { return [] }
      },

      loadLastSession: () => {
        try {
          const raw = localStorage.getItem(SESSION_KEY)
          if (!raw) return
          const state = JSON.parse(raw) as SerializableState
          set({
            players: state.players, arrows: state.arrows, notes: state.notes,
            homeColour: state.homeColour, awayColour: state.awayColour,
          })
        } catch { /* ignore */ }
      },

      exportState: (): string => {
        const s = get()
        const state: SerializableState = {
          players: s.players, arrows: s.arrows, notes: s.notes,
          homeColour: s.homeColour, awayColour: s.awayColour,
        }
        return btoa(encodeURIComponent(JSON.stringify(state)))
      },

      importState: (encoded) => {
        try {
          const state = JSON.parse(decodeURIComponent(atob(encoded))) as SerializableState
          set({
            players: state.players, arrows: state.arrows, notes: state.notes,
            homeColour: state.homeColour, awayColour: state.awayColour,
          })
        } catch { /* ignore */ }
      },
    }),
    {
      partialize: (state) => ({
        players:    state.players,
        arrows:     state.arrows,
        notes:      state.notes,
        homeColour: state.homeColour,
        awayColour: state.awayColour,
      }),
    }
  )
)
