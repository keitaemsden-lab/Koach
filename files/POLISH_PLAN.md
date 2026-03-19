# Koach — Polish, Optimisation & Mobile Plan
> **For Claude Code with Chrome browser plugin access**
> Read this file fully before starting. Use the browser to verify every visual change live at `http://localhost:5173` before marking a task complete.

---

## How to Work Through This Plan

1. Run `npm run dev` and keep it running throughout
2. Open `http://localhost:5173` in Chrome via the browser plugin
3. For each task: implement → view in browser → verify → commit → move on
4. Use DevTools device simulation (F12 → Toggle device toolbar) to test mobile at **390×844** (iPhone 14) and **768×1024** (iPad)
5. Use Chrome's **Lighthouse** audit (DevTools → Lighthouse) after all tasks are done
6. Update `## Current Status` in `CLAUDE.md` at the end of each session

---

## Priority Order

```
P0 — Mobile touch (breaks usability, fix first)
P1 — Pitch orientation toggle (desktop landscape / mobile portrait)
P2 — Player drag feel and precision
P3 — Arrow UX polish
P4 — Visual and layout polish
P5 — Testing and hardening
P6 — Performance
```

---

## P0 — Mobile Touch (Fix First, Everything Else Depends On This)

These are blockers. The app is unusable on phone without them.

### Task M1 — Fix toolbar overflow on mobile

**Problem:** The floating pill toolbar has too many items and overflows on 390px screens, cutting off Export and Save buttons.

**Verify first:** Open DevTools → 390×844 → look at the bottom pill. Note which buttons are cut off.

**Fix in `src/components/layout/Toolbar.tsx`:**

```tsx
// The pill needs horizontal scroll on mobile, but hidden scrollbar
// Add to the pill's outer div:
style={{
  // existing styles...
  overflowX: 'auto',
  scrollbarWidth: 'none',       // Firefox
  msOverflowStyle: 'none',      // IE
}}
// Also add a className with: [&::-webkit-scrollbar]:hidden
```

**Also:** On screens narrower than 480px, collapse the mode toggle labels — show icons only, no text:

```tsx
// In ModeToggle.tsx — hide label text on mobile
<span className="hidden sm:inline">Select</span>
<span className="hidden sm:inline">Draw</span>
```

**Browser check:** Scroll the pill left/right on 390px. All buttons should be reachable. No layout break.

---

### Task M2 — Touch drag activation fix

**Problem:** On touch devices, `@dnd-kit`'s TouchSensor with `delay: 250` means you have to press and hold for 250ms before dragging starts. This feels laggy and unresponsive. Additionally, tapping a player to edit and then trying to drag can get confused.

**Fix in `src/components/board/BoardCanvas.tsx`:**

```tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,        // reduce from 250 → 150ms
      tolerance: 8,      // slightly more forgiving movement during delay
    },
  })
)
```

**Also add touch-action CSS to player tokens** to prevent the browser intercepting touch events before dnd-kit can:

In `PlayerToken.tsx`, ensure the `<g>` element has:
```tsx
style={{
  // existing styles...
  touchAction: 'none',   // already there — verify it IS there
  WebkitUserSelect: 'none',
  userSelect: 'none',
}}
```

**Browser check:** On 390×844 touch simulation, drag a player smoothly with a single touch-drag. Should feel responsive, not laggy. Tap (no drag) should still select/edit.

---

### Task M3 — Touch arrow drawing

**Problem:** Arrow drawing in `DrawingOverlay.tsx` uses `onClick` which on touch devices fires after a delay (300ms tap delay on some browsers). Also, the crosshair cursor is invisible on touch.

**Fix in `src/components/board/DrawingOverlay.tsx`:**

Replace the `onClick` on the `<rect>` with `onPointerUp` to eliminate tap delay:

```tsx
// Replace onClick={onClick} with:
onPointerUp={(e) => {
  // Only treat as a tap if pointer didn't move much (not a pan/scroll)
  onClick(e as unknown as React.MouseEvent)
}}
```

Also add a visual tap indicator — when `drawingState` is active, show a pulsing ring at the start point so the user knows where they tapped:

```tsx
{drawingState && (
  <>
    <circle
      cx={drawingState.start.x}
      cy={drawingState.start.y}
      r={8}
      fill="white"
      opacity={0.15}
      style={{ pointerEvents: 'none' }}
    />
    <circle
      cx={drawingState.start.x}
      cy={drawingState.start.y}
      r={4}
      fill="white"
      opacity={0.8}
      style={{ pointerEvents: 'none' }}
    />
  </>
)}
```

**Browser check:** On touch simulation, enter Draw mode, tap a start point (pulsing dot appears), tap an end point, arrow appears. Test with both straight and curved.

---

### Task M4 — Mobile notes panel z-index and safe area

**Problem:** The notes bottom sheet on mobile appears behind the toolbar pill and doesn't respect iOS safe area insets.

**Fix in `src/components/panels/NotesPanel.tsx`:**

```tsx
// Mobile bottom sheet div — update z-index and padding:
style={{
  // existing styles...
  zIndex: 50,                                    // already 40, bump to 50
  paddingBottom: 'calc(56px + env(safe-area-inset-bottom) + 8px)',  // clear toolbar pill
}}
```

Also add a drag handle bar at the top of the mobile sheet:

```tsx
// Add at top of NotesPanelContent, inside the mobile variant:
<div className="flex justify-center pt-2 pb-1">
  <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
</div>
```

**Browser check:** Open notes panel on 390px. It should slide up, sit above the toolbar, and have a visible drag handle. Content should not be clipped at the bottom.

---

### Task M5 — Player edit popover position on mobile

**Problem:** `PlayerEditPopover` calculates pixel position based on SVG coordinates. On small screens it frequently renders off-screen (clipped at top or left edge).

**Fix in `src/components/ui/PlayerEditPopover.tsx`:**

The current calculation uses `Math.max(0, popLeft)` and `Math.max(0, popTop)` but doesn't clamp to the RIGHT edge or BOTTOM. Fix the clamping:

```tsx
const POPOVER_W = 160  // matches w-40
const POPOVER_H = 200  // approximate

const popLeft = Math.max(
  4,
  Math.min(
    screenX - POPOVER_W / 2,
    (containerRect?.width ?? 400) - POPOVER_W - 4
  )
)

const popTop = Math.max(
  4,
  Math.min(
    screenY - POPOVER_H - 20,  // prefer above token
    (containerRect?.height ?? 600) - POPOVER_H - 4  // but clamp to container bottom
  )
)
```

**Browser check:** On 390px, tap a player near each edge (top-left, top-right, bottom-left, bottom-right). Popover should always be fully visible within the screen.

---

## P1 — Pitch Orientation Toggle

### Task O1 — Add landscape/portrait toggle state to store

**File: `src/store/types.ts`**

Add to `BoardState`:
```typescript
pitchOrientation: 'portrait' | 'landscape'
```

Add to `BoardActions`:
```typescript
togglePitchOrientation: () => void
```

**File: `src/store/boardStore.ts`**

Add to `initialState`:
```typescript
pitchOrientation: 'portrait',
```

Add action:
```typescript
togglePitchOrientation: () =>
  set((s) => ({ pitchOrientation: s.pitchOrientation === 'portrait' ? 'landscape' : 'portrait' })),
```

Persist `pitchOrientation` to localStorage (add to `SESSION_KEY` save/load and `SerializableState`... actually **don't** add to SerializableState — it's a display preference, not board data. Instead save separately):

```typescript
// In togglePitchOrientation:
const next = get().pitchOrientation === 'portrait' ? 'landscape' : 'portrait'
try { localStorage.setItem('tactic-board:orientation', next) } catch {}
set({ pitchOrientation: next })

// In initialState, read from localStorage:
pitchOrientation: (localStorage.getItem('tactic-board:orientation') as 'portrait' | 'landscape') ?? 'portrait',
```

---

### Task O2 — Implement landscape pitch rendering

**File: `src/components/board/BoardCanvas.tsx`**

The SVG viewBox changes based on orientation. Currently it's always `0 0 680 1050` (portrait). For landscape, it becomes `0 0 1050 680`.

```tsx
const pitchOrientation = useBoardStore((s) => s.pitchOrientation)
const isLandscape = pitchOrientation === 'landscape'

// Change the SVG and wrapper:
<div
  ref={boardRef}
  className="relative flex-shrink-0"
  style={{
    aspectRatio: isLandscape ? '1050 / 680' : '680 / 1050',
    height: isLandscape ? 'auto' : '100%',
    width: isLandscape ? '100%' : 'auto',
    maxWidth: isLandscape ? '100%' : undefined,
    maxHeight: isLandscape ? '100%' : undefined,
  }}
>
  <svg
    ref={svgRef}
    viewBox={isLandscape ? '0 0 1050 680' : '0 0 680 1050'}
    ...
  >
```

**CRITICAL:** The coordinate conversion in `onDragEnd` and `useSVGCoords` hardcodes `680` and `1050`. These must be dynamic:

```tsx
// In BoardCanvas.tsx onDragEnd and anywhere else coordinates are converted:
const VB_W = isLandscape ? 1050 : 680
const VB_H = isLandscape ? 680 : 1050

// Replace all instances of:
// (680 / rect.width) → (VB_W / rect.width)
// (1050 / rect.height) → (VB_H / rect.height)
```

Pass `isLandscape` (or the viewBox dimensions) down to `ArrowLayer`, `DrawingOverlay`, and any other component that converts coordinates.

---

### Task O3 — Rotate PitchSVG for landscape

**File: `src/components/board/PitchSVG.tsx`**

The PitchSVG currently draws assuming a 680×1050 space (portrait). For landscape, it needs to draw in a 1050×680 space.

**Approach:** Pass `orientation` prop and swap all X/Y dimensions:

```tsx
interface PitchSVGProps {
  orientation?: 'portrait' | 'landscape'
}

const PitchSVG = memo(function PitchSVG({ orientation = 'portrait' }: PitchSVGProps) {
  const isLandscape = orientation === 'landscape'

  // Portrait:  viewBox 680×1050, pitch plays top-to-bottom
  // Landscape: viewBox 1050×680, pitch plays left-to-right

  // Key dimension differences:
  // Portrait:  W=660, H=1030, centre=(340,525), halfway is horizontal
  // Landscape: W=1030, H=660, centre=(525,340), halfway is vertical
```

The cleanest implementation: use an SVG `transform="rotate(90, 525, 525)"` or simply redraw with swapped dimensions. The redraw approach is more correct — copy the portrait drawing code and swap every `x`↔`y`, `W`↔`H`, horizontal line↔vertical line.

**Shortcut alternative:** Wrap the existing portrait SVG in a `<g transform="rotate(-90) translate(-1050, 0)">` and set the outer viewBox to `0 0 1050 680`. This rotates the pitch 90° within the new viewBox. Test this approach first as it requires far less code change — if pitch lines look correct, keep it.

---

### Task O4 — Rotate player positions for landscape

**Problem:** When switching from portrait to landscape, all player positions (stored in portrait viewBox units) render in the wrong location.

**In `src/store/boardStore.ts`**, update `togglePitchOrientation`:

```typescript
togglePitchOrientation: () => {
  const current = get().pitchOrientation
  const next = current === 'portrait' ? 'landscape' : 'portrait'

  // Transform all player positions
  set((s) => ({
    pitchOrientation: next,
    players: s.players.map((p) => ({
      ...p,
      // Portrait (680×1050) → Landscape (1050×680):
      // new_x = old_y * (1050/1050) = old_y
      // new_y = (1050 - old_x) * (680/680) = 1050 - old_x
      // Landscape → Portrait: reverse
      x: next === 'landscape' ? p.y : 1050 - p.y,
      y: next === 'landscape' ? (1050 - p.x) : p.x,
      // Wait — think this through carefully:
      // Portrait viewBox: 680 wide, 1050 tall. Attack at top (low y).
      // Landscape viewBox: 1050 wide, 680 tall. Attack at left (low x).
      // Mapping portrait (px, py) → landscape (lx, ly):
      //   lx = py              (portrait y becomes landscape x)
      //   ly = 680 - (px * 680/680) = 680 - px  (portrait x, scaled, becomes landscape y)
      // But portrait x range is 0-680, landscape y range is 0-680 → same scale
      // And portrait y range is 0-1050, landscape x range is 0-1050 → same scale
      // So: lx = py, ly = px (with possible inversion depending on which end is attack)
    })),
    arrows: s.arrows.map((a) => ({
      ...a,
      start: transformPoint(a.start, next),
      end: transformPoint(a.end, next),
      control: a.control ? transformPoint(a.control, next) : undefined,
    })),
  }))

  try { localStorage.setItem('tactic-board:orientation', next) } catch {}
},
```

Add a `transformPoint` helper (outside the store):
```typescript
function transformPoint(p: Point, toOrientation: 'portrait' | 'landscape'): Point {
  if (toOrientation === 'landscape') {
    // Portrait (680×1050) → Landscape (1050×680)
    return { x: p.y, y: p.x }
  } else {
    // Landscape (1050×680) → Portrait (680×1050)
    return { x: p.y, y: p.x }
  }
}
// Note: x↔y swap is symmetric — verify by toggling twice and checking positions return to original
```

**Browser check:** Load a formation in portrait. Toggle to landscape. Players should appear in proportionally correct positions on the landscape pitch. Toggle back — players should be back in original portrait positions.

---

### Task O5 — Add orientation toggle button

**File: `src/components/layout/Toolbar.tsx`**

Import `ArrowsOutLineHorizontal` or `ArrowsOutLineVertical` from Phosphor (or use `ArrowsHorizontal` / `ArrowsVertical`):

```tsx
import { ArrowsHorizontal } from '@phosphor-icons/react'

// Add to the toolbar pill, between UndoRedo and the Notes/Save/Export group:
const pitchOrientation = useBoardStore((s) => s.pitchOrientation)
const togglePitchOrientation = useBoardStore((s) => s.togglePitchOrientation)

<button
  title={pitchOrientation === 'portrait' ? 'Switch to landscape' : 'Switch to portrait'}
  onClick={togglePitchOrientation}
  style={{
    width: 36, height: 36, minWidth: 44,
    background: 'transparent',
    color: 'rgba(255,255,255,0.55)',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}
>
  <ArrowsHorizontal size={18} weight="light" />
</button>
```

**Also:** On mobile (< 768px), **hide the orientation toggle** — mobile always uses portrait. Add `className="hidden md:flex"` to the button wrapper.

**Browser check:** Click the toggle on desktop. Pitch rotates from portrait to landscape. Formation stays positioned correctly. Toggle back — returns to portrait. On 390px mobile, the button should not appear.

---

## P2 — Player Drag Feel and Precision

### Task D1 — Visual drag feedback

**Problem:** When dragging, the token doesn't have a visible "lifted" state. Users can't tell if drag has activated.

**Fix in `src/components/board/PlayerToken.tsx`:**

```tsx
// When isDragging is true:
// 1. Scale up slightly (via SVG transform)
// 2. Increase drop shadow opacity

<g
  transform={`translate(${player.x + dx}, ${player.y + dy}) ${isDragging ? 'scale(1.15)' : 'scale(1)'}`}
  style={{
    cursor: isDragging ? 'grabbing' : (mode === 'draw-arrow' ? 'crosshair' : 'grab'),
    filter: isDragging
      ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))'
      : undefined,
    touchAction: 'none',
    transition: isDragging ? 'none' : 'transform 150ms ease',
    transformOrigin: '0 0',  // SVG transform origin
  }}
>
```

**Note on SVG scale:** SVG `transform` with `scale()` scales around the element's `(0,0)` point (which after translation is the token's centre). This should scale the token in place correctly.

**Browser check:** Drag a player. Token should visibly "lift" (bigger, stronger shadow) while dragging, then settle back when dropped.

---

### Task D2 — Pitch boundary clamping visual indicator

**Problem:** Players can be dragged beyond the pitch boundary (the clamping in `onDragEnd` snaps them back but the drag preview goes outside). This looks broken.

**Fix in `src/components/board/BoardCanvas.tsx`:**

In `onDragEnd`, the clamping already exists (`Math.max(10, Math.min(670, ...))`). The issue is the **preview** during drag doesn't clamp. The preview is the live `transform` in `PlayerToken`.

Add **real-time clamping** to the PlayerToken transform during drag:

```tsx
// In PlayerToken.tsx, clamp the displayed position:
const VB_W = 680  // will need to come from context/prop in Task O2
const VB_H = 1050

const clampedX = Math.max(16, Math.min(VB_W - 16, player.x + dx))
const clampedY = Math.max(16, Math.min(VB_H - 16, player.y + dy))

// Use clampedX/clampedY in the transform, not raw dx/dy
<g transform={`translate(${clampedX}, ${clampedY})`}
```

**Note:** This requires knowing viewBox dimensions in the token. Pass them as props from `PlayerLayer` or use a context. For now, hardcode and update when orientation toggle is wired.

**Browser check:** Drag a player to the edge of the pitch. The token should stop at the pitch boundary, not slide off into the margin.

---

### Task D3 — Snap to pitch zones (optional, implement last in P2)

Add a `gridSnap` toggle to the store (`boolean`, default `false`). When enabled, dropped players snap to a loose grid (approximately 34×52.5 units, or 20×20 columns/rows on the pitch).

```typescript
// In boardStore.ts — onDragEnd snap logic:
const SNAP = 34  // viewBox units per grid cell
const snappedX = gridSnap ? Math.round(newX / SNAP) * SNAP : newX
const snappedY = gridSnap ? Math.round(newY / SNAP) * SNAP : newY
movePlayer(id, snappedX, snappedY)
```

Add a snap toggle button to the toolbar (grid icon). **Only implement if time permits** — it's a nice-to-have.

---

## P3 — Arrow UX Polish

### Task A1 — Fix arrow colour assignment

**Current problem:** All arrows default to `homeColour` regardless of which team's player the user is drawing from. There is no concept of "drawing from a player".

**Pragmatic fix:** In the toolbar's ArrowTypePicker or Toolbar, let users select arrow colour (home/away/neutral) before drawing. Add a colour dot selector next to the arrow type picker:

```tsx
// In ArrowTypePicker.tsx, add:
const [arrowTeam, setArrowTeam] = useState<'home' | 'away' | 'neutral'>('home')
const homeColour = useBoardStore((s) => s.homeColour)
const awayColour = useBoardStore((s) => s.awayColour)

// Three small colour dots: home colour, away colour, white/neutral
// Store arrowTeam in boardStore (add to state)
// In DrawingOverlay, use arrowTeam to resolve teamColour
```

**Add to store:**
```typescript
arrowTeam: 'home' | 'away' | 'neutral'  // default: 'home'
setArrowTeam: (team: 'home' | 'away' | 'neutral') => void
```

**In `DrawingOverlay.tsx`, resolve colour:**
```typescript
const arrowTeam = useBoardStore((s) => s.arrowTeam)
const resolvedColour = arrowTeam === 'home' ? homeColour
  : arrowTeam === 'away' ? awayColour
  : '#ffffff'
// Use resolvedColour instead of homeColour when calling addArrow
```

---

### Task A2 — Arrow delete UX

**Current problem:** Users have to select an arrow and press Delete/Backspace — not obvious on mobile, and there's no visual delete button.

**Fix:** When an arrow is selected, show a small `×` button floating at the arrow's midpoint. This is already partially handled by the selected midpoint circle in `ArrowElement.tsx` — replace or augment it:

```tsx
// In ArrowElement.tsx, when isSelected:
{isSelected && (
  <g
    onClick={(e) => { e.stopPropagation(); onDelete() }}
    style={{ cursor: 'pointer' }}
  >
    <circle cx={mid.x} cy={mid.y} r={10} fill="#dc2626" />
    <text
      x={mid.x} y={mid.y}
      textAnchor="middle" dominantBaseline="central"
      fill="white" fontSize={14} fontWeight={700}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >×</text>
  </g>
)}
```

Add `onDelete` prop to `ArrowElement` and wire through `ArrowLayer`:

```tsx
// In ArrowLayer.tsx:
<ArrowElement
  ...
  onDelete={() => removeArrow(arrow.id)}
/>
```

**Browser check:** On mobile touch, tap an arrow, then tap the red × circle that appears. Arrow should be deleted without needing keyboard.

---

### Task A3 — Curved arrow control point visibility

**Current problem:** The blue control point circle for curved arrows is the same blue as the pitch, making it hard to see. Also no instruction to the user that they should drag it.

**Fix:**
1. Change control point to white with blue border:
```tsx
<circle
  ...
  fill="white"
  stroke="var(--accent)"
  strokeWidth={3}
  r={9}  // slightly larger, easier to tap
/>
```

2. Add a tiny label when the control point first appears:
```tsx
// Show for 3 seconds after a curved arrow is placed, then fade
// Use a local useState/useEffect for the visibility
```

---

## P4 — Visual and Layout Polish

### Task V1 — Desktop layout: pitch fills available height better

**Current problem:** On wide laptop screens (1440px+), the portrait pitch is quite narrow and there's wasted space on the sides. In landscape mode, this will be better, but in portrait mode it feels cramped.

**Fix in `src/components/board/BoardCanvas.tsx`:**

```tsx
// Change the aspect-ratio approach:
// Portrait: height-constrained (already works)
// Also add: if the calculated width would exceed 65% of the container width,
// switch to width-constrained and let height follow the aspect ratio

// Simple approach: use CSS aspect-ratio and let the browser handle it
<div
  ref={boardRef}
  className="relative"
  style={{
    aspectRatio: isLandscape ? '1050 / 680' : '680 / 1050',
    maxHeight: '100%',
    maxWidth: '100%',
    // Auto fit within parent:
    height: isLandscape ? 'auto' : '100%',
    width: isLandscape ? '100%' : 'auto',
  }}
>
```

**Browser check:** At 1440px wide, portrait pitch should fill the vertical space without being too narrow. At 768px (tablet), should also look good.

---

### Task V2 — Add a "Clear board" button

**Where:** In the Save/Load modal footer, or as a destructive button in the toolbar overflow menu.

**Implementation:** Simple — clear all arrows (keep players in formation):

```typescript
// Add to store:
clearArrows: () => set({ arrows: [], selectedArrowId: null }),
clearBoard: () => set({
  arrows: [],
  selectedArrowId: null,
  selectedPlayerId: null,
  players: createInitialPlayers(),
  notes: '',
  activeFormation: '4-3-3',
}),
```

Add a "Clear arrows" button and a "Reset board" button to `SaveLoadModal.tsx` at the bottom, with confirmation dialogs.

---

### Task V3 — Empty state and onboarding

**Problem:** A new user landing on the app sees a pitch full of players with no explanation of how to interact.

**Add a simple one-time help overlay:**

```tsx
// New component: src/components/ui/HelpOverlay.tsx
// Show on first visit (localStorage flag 'tactic-board:seen-help')
// Dismiss on any interaction or after 5 seconds

// Content:
// "Drag players to position them"
// "Switch to Draw mode to add movement arrows"
// "Tap any player to edit name and position"
// [Got it] button
```

Display as a semi-transparent overlay in the bottom-left of the pitch canvas (not blocking the pitch).

---

### Task V4 — Improve ExportButton styling

**Current:** Export button uses a mix of border and DM Mono font — inconsistent with the other toolbar buttons.

**Fix in `src/components/toolbar/ExportButton.tsx`:**

```tsx
// Make it consistent with Notes/Save buttons:
style={{
  width: 36, height: 36, minWidth: 44,
  background: 'transparent',
  color: 'rgba(255,255,255,0.55)',
  border: 'none',   // remove the border
  borderRadius: 8,
  cursor: loading ? 'wait' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'color 150ms ease',
}}
```

---

### Task V5 — Favicon and meta tags

**Current:** `public/favicon.svg` exists but appears to be the Vite/Superpowers logo. Replace with a pitch-themed icon.

**Create a simple pitch favicon** — a green rectangle with white centre circle:

```svg
<!-- public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#2a5240"/>
  <rect x="2" y="2" width="28" height="28" rx="4" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
  <line x1="16" y1="2" x2="16" y2="30" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
  <circle cx="16" cy="16" r="5" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
  <circle cx="16" cy="16" r="1" fill="rgba(255,255,255,0.9)"/>
</svg>
```

---

## P5 — Testing and Hardening

### Task T1 — Browser-based visual regression check

**Using the Chrome plugin:**

Navigate to `http://localhost:5173` and perform these checks visually. Note any issues found.

**Checklist — Desktop Chrome (1440×900):**
- [ ] Light mode: pitch green, header white, pill toolbar visible over pitch
- [ ] Dark mode: background #141920, pitch deep emerald, pill solid #1c2333
- [ ] Toggle between modes: instant, no flash
- [ ] Drag 3 players to new positions — smooth, correct drop
- [ ] Draw straight run arrow — appears correctly
- [ ] Draw curved pass arrow — midpoint handle draggable
- [ ] Press arrow (dotted) — correct dash pattern
- [ ] Select arrow — red × appears, click it — arrow deleted
- [ ] Undo (Cmd+Z) — arrow restored
- [ ] Redo (Cmd+Shift+Z) — arrow removed again
- [ ] Load formation from picker — confirmation dialog appears
- [ ] Open Notes panel — slides in from right
- [ ] Type in notes — text appears, char counter updates
- [ ] Save formation — appears in saves list
- [ ] Load saved formation — players reposition
- [ ] Export PNG — file downloads, contains pitch image only
- [ ] Share link — URL updates, copy-to-clipboard notification
- [ ] Open shared URL — board state restores
- [ ] Reload page — last session restores

**Checklist — Mobile 390×844 (DevTools simulation):**
- [ ] Pitch fills screen width in portrait
- [ ] Toolbar pill visible at bottom, all buttons reachable via scroll
- [ ] Tap player → popover appears, fully on screen
- [ ] Drag player → activates at 150ms, feels responsive
- [ ] Draw mode → tap start → dot appears → tap end → arrow appears
- [ ] Orientation toggle hidden on mobile
- [ ] Notes panel opens as bottom sheet, sits above toolbar
- [ ] Save/Load modal centred on screen

---

### Task T2 — Fix any issues found in T1

Work through the T1 checklist, fix any failing items. Commit each fix separately.

---

### Task T3 — localStorage error hardening

Every `localStorage.getItem/setItem` call is already wrapped in try/catch. Verify `listSaves()` handles corrupted JSON gracefully:

```typescript
listSaves: (): SavedFormation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Validate it's actually an array of SavedFormation objects
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s) =>
      typeof s?.name === 'string' &&
      typeof s?.savedAt === 'number' &&
      s?.state?.players !== undefined
    )
  } catch {
    return []
  }
},
```

---

### Task T4 — URL state size guard

**Current:** `ShareButton` alerts if URL > 3000 chars. Test with a board that has many arrows.

Run a test: draw 10 arrows, open share. Check URL length. If it exceeds 3000 chars, the alert fires. This is correct, but the UX is bad.

**Improve:** Instead of `alert()`, show a dismissable banner above the toolbar:

```tsx
// In ShareButton.tsx or App.tsx:
const [showLongUrlWarning, setShowLongUrlWarning] = useState(false)

// Instead of alert:
if (url.length > 3000) {
  setShowLongUrlWarning(true)
  setTimeout(() => setShowLongUrlWarning(false), 4000)
  return  // don't copy the URL if it's too long
}

// Render a banner:
{showLongUrlWarning && (
  <div style={{
    position: 'fixed', top: 52, left: '50%', transform: 'translateX(-50%)',
    background: '#f59e0b', color: 'white', padding: '8px 16px',
    borderRadius: 8, fontSize: 12, zIndex: 100, fontFamily: 'Inter, sans-serif',
  }}>
    Board is too large to share via URL — save it locally instead
  </div>
)}
```

---

## P6 — Performance

### Task P1 — Memoize PlayerToken

`PlayerToken` re-renders on every store change because `PlayerLayer` re-renders. Wrap in `React.memo`:

```tsx
// PlayerToken.tsx already likely exports a plain function.
// Wrap it:
export default memo(PlayerToken)

// Also memo PlayerLayer:
export default memo(PlayerLayer)

// Add display names:
PlayerToken.displayName = 'PlayerToken'
```

---

### Task P2 — Memoize ArrowElement

Same pattern as P1:

```tsx
export default memo(ArrowElement)
ArrowElement.displayName = 'ArrowElement'
```

---

### Task P3 — Debounce auto-save

Auto-save is already debounced at 500ms in `App.tsx`. Verify the debounce works correctly — the `clearTimeout` should fire on every state change, not just when the component re-renders.

The current implementation subscribes to the store inside `useEffect` which is correct. Verify it doesn't create multiple subscriptions if App re-renders (it shouldn't because the subscription is created once with an empty dep array).

---

### Task P4 — SVG gradient deduplication

**Problem:** `PlayerToken` creates `<defs>` with `radialGradient` and `filter` elements namespaced per player ID (e.g. `grad-{uuid}`). With 22 players, this is 66 SVG `<defs>` elements. This is correct for avoiding ID collisions, but it could be optimised.

**Pragmatic fix for now:** Ensure each `<defs>` is inside the `<g>` element for the token (it already is per the current code). Modern browsers handle this fine at 22 instances. **Skip this optimisation unless Lighthouse flags it.** Note it for future work.

---

## Final Steps

### Task F1 — Run Lighthouse audit

In Chrome DevTools → Lighthouse → run audit on `http://localhost:5173`.

Target scores:
- Performance: > 85
- Accessibility: > 80 (SVG elements need `aria-label` on interactive elements)
- Best Practices: > 90

Fix any P0 Lighthouse issues found.

---

### Task F2 — Add basic ARIA labels

Critical accessibility fixes for the toolbar:

```tsx
// All icon-only buttons need aria-label (most already have title — add aria-label too):
<button aria-label="Toggle notes panel" title="Toggle notes (N)" ...>
<button aria-label="Save formation" title="Save / Load" ...>
<button aria-label="Export as PNG" title="Export as PNG" ...>
<button aria-label="Switch to select mode" title="Select / Move (S)" ...>
<button aria-label="Switch to draw mode" title="Draw Arrow (D)" ...>
```

---

### Task F3 — Update CLAUDE.md

At the end of all tasks, update `CLAUDE.md`:

```markdown
## Current Status
Last completed task: F3 — CLAUDE.md updated
Current phase: DONE — Polish pass complete
Known issues: [list any outstanding issues]
Next session: [any remaining work]

## Design Decisions Added This Session
- Pitch orientation: portrait (mobile default) / landscape (desktop option)
- Arrow team colour: selectable per arrow (home/away/neutral)
- Orientation toggle hidden on mobile < 768px
- Player positions transform x↔y when switching orientation
- Control point colour: white fill, blue stroke (was all-blue, invisible)
```

---

## Quick Reference — Key File Locations

| What | File |
|---|---|
| Store state + actions | `src/store/boardStore.ts` |
| All TypeScript types | `src/store/types.ts` |
| Formation positions | `src/store/formations.ts` |
| Pitch SVG drawing | `src/components/board/PitchSVG.tsx` |
| Player drag | `src/components/board/PlayerToken.tsx` |
| Arrow rendering | `src/components/board/ArrowElement.tsx` |
| Arrow drawing logic | `src/components/board/DrawingOverlay.tsx` |
| Coordinate conversion | `src/hooks/useSVGCoords.ts` |
| Main layout | `src/App.tsx` |
| Toolbar pill | `src/components/layout/Toolbar.tsx` |
| CSS variables + dark mode | `src/styles/index.css` |

---

## Browser Plugin Usage Instructions

Throughout this plan, use the Chrome browser plugin to:

1. **Verify visual changes** — after every task, navigate to `localhost:5173` and confirm the change looks correct before committing
2. **Test responsive breakpoints** — use DevTools device toolbar for 390×844 (iPhone) and 768×1024 (iPad) checks
3. **Check console errors** — open DevTools Console tab, look for React warnings or uncaught errors after each change
4. **Inspect element** — use the Elements tab to verify CSS variables are applying correctly in both light and dark mode
5. **Test touch interactions** — enable touch simulation in DevTools to test drag and tap behaviours
6. **Run Lighthouse** — at the end (Task F1) for performance and accessibility scores

**Standard verify sequence after each task:**
1. Open `localhost:5173`
2. Check light mode visually
3. Toggle dark mode — check again
4. Open DevTools Console — look for errors
5. Switch to 390px device simulation — check mobile layout
6. Switch back to desktop
