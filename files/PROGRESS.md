# Koach Polish Plan — Progress Tracker

Last updated: 2026-03-19
Resume here if context window resets. Read POLISH_PLAN.md for full implementation details per task.

## How to resume
1. `cd tactic-board && npm run dev`
2. Check this file for first unchecked task
3. Open POLISH_PLAN.md and jump to that task section
4. Implement → browser verify → commit → check off → next task

---

## Session 1 — P0 Mobile + P1 Orientation (~Tasks 1–8)

- [ ] **M1** — Toolbar overflow on mobile (Toolbar.tsx: overflow-x auto, hide mode labels on sm)
- [ ] **M2** — Touch drag activation delay (BoardCanvas.tsx: TouchSensor delay 150ms, tolerance 8)
- [ ] **M3** — Touch arrow drawing (DrawingOverlay.tsx: onClick → onPointerUp, pulsing start dot)
- [ ] **M4** — Notes panel z-index + safe area (NotesPanel.tsx: z-50, padding-bottom env(), drag handle)
- [ ] **M5** — Player edit popover clamping (PlayerEditPopover.tsx: clamp all 4 edges)
- [ ] **O1** — Add orientation state to store (types.ts + boardStore.ts: pitchOrientation, togglePitchOrientation)
- [ ] **O2** — Landscape viewBox rendering (BoardCanvas.tsx: dynamic VB_W/VB_H, aspect ratio)
- [ ] **O3** — Rotate PitchSVG for landscape (PitchSVG.tsx: SVG transform rotation or swapped dims)
- [ ] **O4** — Rotate player positions on toggle (boardStore.ts: x↔y swap transform in togglePitchOrientation)
- [ ] **O5** — Orientation toggle button (Toolbar.tsx: ArrowsHorizontal icon, hidden md:flex)

---

## Session 2 — P2 Drag + P3 Arrows + P4 Visual + P5 Testing + P6 Perf + Final

- [ ] **D1** — Drag scale feedback (PlayerToken.tsx: scale(1.15) + stronger drop shadow while isDragging)
- [ ] **D2** — Pitch boundary clamping during drag preview (PlayerToken.tsx: clamp displayed x/y to viewBox)
- [ ] **A1** — Arrow colour assignment (store: arrowTeam state, DrawingOverlay: resolve colour)
- [ ] **A2** — Arrow delete button (ArrowElement.tsx: red × at midpoint when selected, onDelete prop)
- [ ] **A3** — Curved arrow control point visibility (ArrowElement.tsx: white fill, blue stroke, r=9)
- [ ] **V1** — Desktop layout pitch fills height better (BoardCanvas.tsx: CSS aspect-ratio fix)
- [ ] **V2** — Clear board button (SaveLoadModal.tsx: clearArrows + clearBoard with confirmation)
- [ ] **V3** — Onboarding help overlay (new HelpOverlay.tsx: first-visit, localStorage flag)
- [ ] **V4** — Export button styling consistency (ExportButton.tsx: remove border, match toolbar buttons)
- [ ] **V5** — Favicon + meta tags (public/favicon.svg: pitch icon, index.html meta)
- [ ] **T3** — localStorage hardening (boardStore.ts: validate array shape in listSaves)
- [ ] **T4** — URL state size guard (ShareButton.tsx: replace alert() with dismissable banner)
- [ ] **P1** — Memoize PlayerToken (PlayerToken.tsx: React.memo + displayName)
- [ ] **P2** — Memoize ArrowElement (ArrowElement.tsx: React.memo + displayName)
- [ ] **F2** — ARIA labels (Toolbar.tsx + all icon-only buttons: aria-label attributes)
- [ ] **F3** — Update CLAUDE.md current status

---

## Architectural Risk Notes

- **M3**: Replace onClick with onPointerUp inside dnd-kit DndContext — check e.isPrimary, e.preventDefault()
- **O3+O4**: Heaviest task. Commit O3 (pitch visual) separately from O4 (position rotation). Verify toggle-twice returns to original positions.
- **A1**: arrowTeam must be optional on Arrow type (arrowTeam?: string) — don't break existing serialised URL states
- **SerializableState**: NEVER add required fields — always optional with defaults
