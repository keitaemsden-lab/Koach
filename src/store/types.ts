// ─── Primitives ─────────────────────────────────────────────────────────────

export type Point = {
  x: number
  y: number
}

export type Team = 'home' | 'away'

export type Mode = 'select' | 'draw-arrow'

export type ArrowType = 'run' | 'pass' | 'press'

export type ArrowStyle = 'straight' | 'curved'

export type PositionLabel =
  | 'GK'
  | 'RB' | 'LB' | 'CB' | 'RCB' | 'LCB' | 'RWB' | 'LWB'
  | 'CDM' | 'CM' | 'RCM' | 'LCM' | 'CAM' | 'DM'
  | 'RW' | 'LW' | 'RAM' | 'LAM'
  | 'CF' | 'ST' | 'SS'

export type FormationName =
  | '4-3-3'
  | '4-4-2'
  | '4-2-3-1'
  | '3-5-2'
  | '5-3-2'
  | '4-5-1'


// ─── Core Entities ──────────────────────────────────────────────────────────

export type Player = {
  id: string                  // nanoid or crypto.randomUUID()
  team: Team
  position: PositionLabel
  name: string                // display name, e.g. 'Ronaldo' or '#9'
  x: number                   // SVG viewBox x coordinate
  y: number                   // SVG viewBox y coordinate
}

export type Arrow = {
  id: string
  type: ArrowType
  style: ArrowStyle
  start: Point
  end: Point
  control?: Point             // only for curved arrows (bezier control point)
  teamColour: string          // hex — resolved at draw time from store
}


// ─── Formations ─────────────────────────────────────────────────────────────

export type FormationPosition = {
  position: PositionLabel
  x: number
  y: number
}

export type Formation = {
  name: FormationName
  positions: FormationPosition[]
}


// ─── Saved State ─────────────────────────────────────────────────────────────

// Serialisable state — saved to localStorage / URL hash
// Excludes all ephemeral UI state
export type SerializableState = {
  players: Player[]
  arrows: Arrow[]
  notes: string
  homeColour: string
  awayColour: string
}

export type SavedFormation = {
  name: string                // user-defined label
  savedAt: number             // Date.now() timestamp
  state: SerializableState
}


// ─── Drawing State (Ephemeral) ───────────────────────────────────────────────

// Tracks in-progress arrow draw — not persisted, not in undo stack
export type DrawingState = {
  phase: 'start-placed' | 'drawing'
  start: Point
  currentPointer: Point       // live cursor position for preview
  control?: Point             // bezier control point (curved only)
}


// ─── Store ───────────────────────────────────────────────────────────────────

export type BoardState = {
  // Mode
  mode: Mode
  arrowType: ArrowType
  arrowStyle: ArrowStyle

  // Board content (tracked in undo stack)
  players: Player[]
  arrows: Arrow[]
  notes: string
  homeColour: string
  awayColour: string

  // UI state (not in undo stack)
  selectedPlayerId: string | null
  selectedArrowId: string | null
  isDarkMode: boolean
  isNotesPanelOpen: boolean
  isSaveLoadModalOpen: boolean
  drawingState: DrawingState | null
  activeFormation: FormationName | null
  pitchOrientation: 'portrait' | 'landscape'
}

export type BoardActions = {
  // Mode
  setMode: (mode: Mode) => void
  setArrowType: (type: ArrowType) => void
  setArrowStyle: (style: ArrowStyle) => void

  // Players
  movePlayer: (id: string, x: number, y: number) => void
  updatePlayer: (id: string, patch: Partial<Omit<Player, 'id'>>) => void
  removePlayer: (id: string) => void

  // Arrows
  addArrow: (arrow: Omit<Arrow, 'id'>) => void
  updateArrowControl: (id: string, control: Point) => void
  removeArrow: (id: string) => void

  // Drawing
  setDrawingState: (state: DrawingState | null) => void

  // Selection
  selectPlayer: (id: string | null) => void
  selectArrow: (id: string | null) => void

  // Formations
  loadFormation: (name: FormationName) => void

  // Colours
  setHomeColour: (colour: string) => void
  setAwayColour: (colour: string) => void

  // Notes
  setNotes: (notes: string) => void

  // UI toggles
  toggleDarkMode: () => void
  toggleNotesPanel: () => void
  toggleSaveLoadModal: () => void

  // Persistence
  saveToLocalStorage: (name: string) => void
  loadFromLocalStorage: (name: string) => void
  deleteSave: (name: string) => void
  listSaves: () => SavedFormation[]
  loadLastSession: () => void

  // Share / Export
  exportState: () => string
  importState: (encoded: string) => void

  // Orientation
  togglePitchOrientation: () => void
}

export type BoardStore = BoardState & BoardActions
