import { create } from 'zustand'
import { temporal } from 'zundo'
import type {
  BoardStore, BoardState, SerializableState, SavedFormation, Player, ArrowTeam,
} from './types'
import { FORMATIONS } from './formations'
import { blankPlayers, slotPoint, DEFAULT_HOME_KIT, DEFAULT_AWAY_KIT, SLOT_NUMBERS } from './demo'
import { normaliseState } from '@/utils/geometry'
import { encodeState, decodeState } from '@/utils/encode'

export const STORAGE_KEY = 'tactic-board:saves'
export const SESSION_KEY = 'tactic-board:last-session'
const DARK_KEY      = 'tactic-board:dark-mode'
const ORIENT_KEY    = 'koach:orientation'
export const DEFAULT_TITLE = 'Untitled board'

function applyDark(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.dataset.theme = isDark ? 'night' : 'day'
}

/** Floodlight is a night-match design: night unless the user has chosen day. */
function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem(DARK_KEY)
    if (stored !== null) return stored === 'true'
  } catch { /* ignore */ }
  return true
}

function getInitialOrientation(): BoardState['orientationPref'] {
  try {
    const v = localStorage.getItem(ORIENT_KEY)
    return v === 'portrait' || v === 'landscape' ? v : null
  } catch { return null }
}

const initialDark = getInitialDark()
applyDark(initialDark)

const initialState: BoardState = {
  mode: 'select',
  arrowType: 'run',
  arrowStyle: 'curved',
  players: blankPlayers(),
  arrows: [],
  notes: '',
  homeColour: DEFAULT_HOME_KIT,
  awayColour: DEFAULT_AWAY_KIT,
  title: DEFAULT_TITLE,
  selectedPlayerId: null,
  selectedArrowId: null,
  isDarkMode: initialDark,
  isNotesPanelOpen: false,
  isSaveLoadModalOpen: false,
  isMoreOpen: false,
  isShapeOpen: false,
  drawingState: null,
  activeFormation: '4-3-3',
  awayFormation: '4-3-3',
  orientationPref: getInitialOrientation(),
  arrowTeam: 'home',
}

/** Board content from any stored shape (legacy landscape boards are rotated back to portrait). */
export function boardFromState(raw: SerializableState) {
  const s = normaliseState(raw)
  return {
    players: s.players,
    arrows: s.arrows,
    notes: s.notes,
    homeColour: s.homeColour || DEFAULT_HOME_KIT,
    awayColour: s.awayColour || DEFAULT_AWAY_KIT,
    title: s.title || DEFAULT_TITLE,
    activeFormation: s.homeFormation ?? null,
    awayFormation: s.awayFormation ?? null,
    selectedPlayerId: null,
    selectedArrowId: null,
  }
}

export function serialise(s: BoardState): SerializableState {
  return {
    players: s.players, arrows: s.arrows, notes: s.notes,
    homeColour: s.homeColour, awayColour: s.awayColour,
    title: s.title, homeFormation: s.activeFormation, awayFormation: s.awayFormation,
    orientation: 'portrait',
  }
}

/** Arrows that start on a player keep their start on that player. */
function followPlayers(arrows: BoardState['arrows'], players: Player[]) {
  let changed = false
  const next = arrows.map((a) => {
    if (!a.fromId) return a
    const p = players.find((q) => q.id === a.fromId)
    if (!p || (p.x === a.start.x && p.y === a.start.y)) return a
    changed = true
    return { ...a, start: { x: p.x, y: p.y } }
  })
  return changed ? next : arrows
}

const INK_ORDER: ArrowTeam[] = ['home', 'away', 'neutral']

export const useBoardStore = create<BoardStore>()(
  temporal(
    (set, get) => ({
      ...initialState,

      setMode: (mode) => set({ mode, drawingState: null, ...(mode === 'draw-arrow' ? { selectedPlayerId: null } : {}) }),
      setArrowType: (arrowType) => set({ arrowType }),
      setArrowStyle: (arrowStyle) => set({ arrowStyle }),

      movePlayer: (id, x, y) =>
        set((s) => {
          const mover = s.players.find((p) => p.id === id)
          const players = s.players.map((p) => p.id === id ? { ...p, x, y } : p)
          return {
            players,
            arrows: followPlayers(s.arrows, players),
            ...(mover?.team === 'away' ? { awayFormation: null } : { activeFormation: null }),
          }
        }),

      updatePlayer: (id, patch) =>
        set((s) => ({
          players: s.players.map((p) => p.id === id ? { ...p, ...patch } : p),
        })),

      removePlayer: (id) =>
        set((s) => {
          const gone = s.players.find((p) => p.id === id)
          return {
            players: s.players.filter((p) => p.id !== id),
            arrows: s.arrows.map((a) => a.fromId === id ? { ...a, fromId: undefined } : a),
            selectedPlayerId: s.selectedPlayerId === id ? null : s.selectedPlayerId,
            ...(gone?.team === 'away' ? { awayFormation: null } : { activeFormation: null }),
          }
        }),

      addArrow: (arrow) =>
        set((s) => ({ arrows: [...s.arrows, { ...arrow, id: crypto.randomUUID() }] })),

      updateArrowControl: (id, control) =>
        set((s) => ({ arrows: s.arrows.map((a) => a.id === id ? { ...a, control, style: 'curved' } : a) })),

      removeArrow: (id) =>
        set((s) => ({
          arrows: s.arrows.filter((a) => a.id !== id),
          selectedArrowId: s.selectedArrowId === id ? null : s.selectedArrowId,
        })),

      setDrawingState: (drawingState) => set({ drawingState }),

      selectPlayer: (id) => set({ selectedPlayerId: id, selectedArrowId: null }),
      selectArrow:  (id) => set({ selectedArrowId: id, selectedPlayerId: null }),

      loadFormation: (name, ownHalf, team = 'both') => {
        if (!FORMATIONS[name]) return
        set((s) => {
          const reshape = (side: 'home' | 'away', current: Player[]): Player[] =>
            FORMATIONS[name].map((fp, i) => ({
              id: current[i]?.id ?? crypto.randomUUID(),
              team: side,
              position: fp.position,
              name: current[i]?.name ?? '',
              number: current[i]?.number ?? SLOT_NUMBERS[i],
              ...slotPoint(side, name, i, ownHalf),
            }))
          const home = s.players.filter((p) => p.team === 'home')
          const away = s.players.filter((p) => p.team === 'away')
          const newHome = team === 'away' ? home : reshape('home', home)
          const newAway = team === 'home' ? away : reshape('away', away)
          const players = [...newHome, ...newAway]
          return {
            players,
            arrows: followPlayers(s.arrows, players),
            activeFormation: team === 'away' ? s.activeFormation : name,
            awayFormation: team === 'home' ? s.awayFormation : name,
          }
        })
      },

      setHomeColour: (homeColour) => set({ homeColour }),
      setAwayColour: (awayColour) => set({ awayColour }),
      setNotes: (notes) => set({ notes }),
      setTitle: (title) => set({ title }),

      toggleDarkMode: () => {
        const isDark = !get().isDarkMode
        applyDark(isDark)
        try { localStorage.setItem(DARK_KEY, String(isDark)) } catch { /* ignore */ }
        set({ isDarkMode: isDark })
      },

      toggleNotesPanel:    () => set((s) => ({ isNotesPanelOpen: !s.isNotesPanelOpen })),
      toggleSaveLoadModal: () => set((s) => ({ isSaveLoadModalOpen: !s.isSaveLoadModalOpen })),
      setNotesPanelOpen: (isNotesPanelOpen) => set({ isNotesPanelOpen }),
      setMoreOpen: (isMoreOpen) => set({ isMoreOpen }),
      setShapeOpen: (isShapeOpen) => set({ isShapeOpen }),

      saveToLocalStorage: (name) => {
        const s = get()
        const saves = s.listSaves()
        const newSave: SavedFormation = { name, savedAt: Date.now(), state: serialise(s) }
        const idx = saves.findIndex((sv) => sv.name === name)
        if (idx >= 0) saves[idx] = newSave; else saves.push(newSave)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saves.slice(-20))) } catch { /* ignore */ }
      },

      loadFromLocalStorage: (name) => {
        const save = get().listSaves().find((s) => s.name === name)
        if (!save) return
        set(boardFromState(save.state))
      },

      deleteSave: (name) => {
        const saves = get().listSaves().filter((s) => s.name !== name)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saves)) } catch { /* ignore */ }
      },

      listSaves: (): SavedFormation[] => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (!raw) return []
          const parsed = JSON.parse(raw)
          if (!Array.isArray(parsed)) return []
          return parsed.filter((s) =>
            typeof s?.name === 'string' &&
            typeof s?.savedAt === 'number' &&
            s?.state?.players !== undefined
          )
        } catch { return [] }
      },

      loadLastSession: () => {
        try {
          const raw = localStorage.getItem(SESSION_KEY)
          if (!raw) return
          const state = JSON.parse(raw) as SerializableState
          if (!Array.isArray(state?.players)) return
          set(boardFromState(state))
        } catch { /* ignore */ }
      },

      exportState: () => encodeState(serialise(get())),

      importState: async (encoded) => {
        try {
          const state = await decodeState(decodeURIComponent(encoded))
          if (!Array.isArray(state?.players)) return
          set(boardFromState(state))
        } catch { /* ignore */ }
      },

      setOrientationPref: (orientationPref) => {
        try {
          if (orientationPref) localStorage.setItem(ORIENT_KEY, orientationPref)
          else localStorage.removeItem(ORIENT_KEY)
        } catch { /* ignore */ }
        set({ orientationPref })
      },

      setArrowTeam: (arrowTeam) => set({ arrowTeam }),
      cycleArrowTeam: () => set((s) => ({ arrowTeam: INK_ORDER[(INK_ORDER.indexOf(s.arrowTeam) + 1) % INK_ORDER.length] })),

      clearArrows: () => set({ arrows: [], selectedArrowId: null }),

      clearBoard: () => set({
        arrows: [],
        selectedArrowId: null,
        selectedPlayerId: null,
        players: blankPlayers(),
        notes: '',
        title: DEFAULT_TITLE,
        activeFormation: '4-3-3',
        awayFormation: '4-3-3',
      }),
    }),
    {
      partialize: (state) => ({
        players:    state.players,
        arrows:     state.arrows,
        notes:      state.notes,
        homeColour: state.homeColour,
        awayColour: state.awayColour,
        title:      state.title,
        activeFormation: state.activeFormation,
        awayFormation:   state.awayFormation,
      }),
      // only record a step when board content actually changed (not on selection or UI toggles)
      equality: (a, b) =>
        a.players === b.players && a.arrows === b.arrows && a.notes === b.notes &&
        a.homeColour === b.homeColour && a.awayColour === b.awayColour && a.title === b.title &&
        a.activeFormation === b.activeFormation && a.awayFormation === b.awayFormation,
      limit: 50,
    }
  )
)
