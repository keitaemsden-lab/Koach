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

// Coordinates are canonical PORTRAIT pitch units: x 0..680 (touchline to touchline),
// y 0..1050 (opposition goal line at 0, home goal line at 1050). 10 units = 1 metre.
// Landscape is a view transform only (see utils/geometry.ts), never stored.
export type Player = {
  id: string                  // nanoid or crypto.randomUUID()
  team: Team
  position: PositionLabel
  name: string                // display name, e.g. 'Ronaldo'; empty shows the position
  number?: number             // shirt number shown in the token (optional for legacy boards)
  x: number
  y: number
}

export type Arrow = {
  id: string
  type: ArrowType
  style: ArrowStyle
  start: Point
  end: Point
  control?: Point             // only for curved arrows (bezier control point)
  teamColour: string          // hex, resolved at draw time (kept for legacy boards)
  team?: ArrowTeam            // whose ink: home, away or neutral
  fromId?: string             // player the arrow starts on; the start follows that player
}

export type ArrowTeam = 'home' | 'away' | 'neutral'


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
  title?: string
  homeFormation?: FormationName | null
  awayFormation?: FormationName | null
  /** 'portrait' marks canonical coordinates. Missing on boards saved before the redesign. */
  orientation?: 'portrait'
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
  fromId?: string             // player the draw started on
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
  title: string

  // UI state (not in undo stack)
  selectedPlayerId: string | null
  selectedArrowId: string | null
  isDarkMode: boolean
  isNotesPanelOpen: boolean
  isSaveLoadModalOpen: boolean
  drawingState: DrawingState | null
  activeFormation: FormationName | null      // home shape; null once a player is moved
  awayFormation: FormationName | null
  /** Manual pitch orientation; null follows the screen (landscape on wide screens). */
  orientationPref: 'portrait' | 'landscape' | null
  arrowTeam: ArrowTeam
  isMoreOpen: boolean
  isShapeOpen: boolean
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
  loadFormation: (name: FormationName, ownHalf?: boolean, team?: Team | 'both') => void

  // Colours
  setHomeColour: (colour: string) => void
  setAwayColour: (colour: string) => void

  // Notes and title
  setNotes: (notes: string) => void
  setTitle: (title: string) => void

  // UI toggles
  toggleDarkMode: () => void
  toggleNotesPanel: () => void
  toggleSaveLoadModal: () => void
  setNotesPanelOpen: (open: boolean) => void
  setMoreOpen: (open: boolean) => void
  setShapeOpen: (open: boolean) => void

  // Persistence
  saveToLocalStorage: (name: string) => void
  loadFromLocalStorage: (name: string) => void
  deleteSave: (name: string) => void
  listSaves: () => SavedFormation[]
  loadLastSession: () => void

  // Share / Export
  exportState: () => Promise<string>
  importState: (encoded: string) => Promise<void>

  // Clear
  clearArrows: () => void
  clearBoard: () => void

  // Orientation (view only)
  setOrientationPref: (pref: 'portrait' | 'landscape' | null) => void

  // Arrow ink
  setArrowTeam: (team: ArrowTeam) => void
  cycleArrowTeam: () => void
}

export type BoardStore = BoardState & BoardActions
