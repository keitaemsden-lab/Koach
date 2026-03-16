# Koach UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Koach tactic board UI from a functional MVP into a premium, elite sports analytics aesthetic — new colour system, floating glassmorphism pill toolbar, 3D bevel player tokens, Phosphor icons, and Inter typography throughout.

**Architecture:** Pure visual upgrade — no store, hook, or business logic changes. CSS variables are the primary lever; component JSX is updated for layout (toolbar positioning), SVG structure (token gradients/filters), and icon swaps. A single new utility (`colour.ts`) supports the token gradient.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, SVG, `@phosphor-icons/react` (new), Google Fonts (Inter + DM Mono)

---

## Chunk 1: Foundation — Dependencies, CSS, Fonts

### Task 1: Install Phosphor Icons

**Files:**
- Modify: `tactic-board/package.json`

- [ ] **Step 1: Install the package**

```bash
cd "C:\Users\Keita\Documents\Dev Ops\Tactik\tactic-board"
npm install @phosphor-icons/react
```

Expected output: `added 1 package` (or similar), no errors.

- [ ] **Step 2: Verify the import resolves**

```bash
node -e "require('@phosphor-icons/react')" 2>&1 || echo "OK - ESM only, expected"
```

Expected: either `OK` or an ESM note — no `Cannot find module` error.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @phosphor-icons/react"
```

---

### Task 2: Update Google Fonts in index.html

**Files:**
- Modify: `tactic-board/index.html`

- [ ] **Step 1: Read the current index.html**

Open `tactic-board/index.html` and locate the existing `<link>` tags for Google Fonts (currently loads DM Mono and Space Mono).

- [ ] **Step 2: Replace or correct the font links**

The file may already have a partial Google Fonts link. Regardless of what is there, replace the entire set of Google Fonts `<link>` tags with exactly these three lines:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=DM+Mono:wght@400&display=swap" rel="stylesheet">
```

Key requirements:
- Inter must include `wght@800` — this weight is used for player token position labels (`fontWeight={800}`)
- DM Mono must include `wght@400` only
- Remove any previous links loading Space Mono, or DM Mono with extra weights

Keep exactly the three lines above; do not leave any old font `<link>` tags.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "chore: load Inter + DM Mono from Google Fonts with display=swap"
```

---

### Task 3: Rewrite CSS custom properties

**Files:**
- Modify: `tactic-board/src/styles/index.css`

- [ ] **Step 1: Replace the `:root` block**

Replace the entire `:root { ... }` block with:

```css
:root {
  --bg-app:         #f0f2f5;
  --bg-surface:     #ffffff;
  --bg-toolbar:     var(--bg-surface);
  --bg-panel:       var(--bg-surface);
  --border:         #e4e7ec;
  --text-primary:   #0f172a;
  --text-secondary: #6b7280;
  --accent:         #2563eb;
  --pitch-fill:     #3d6b52;
  --pitch-alt:      #446059;
  --pitch-lines:    rgba(255, 255, 255, 0.92);
}
```

- [ ] **Step 2: Replace the `.dark` block**

Replace the entire `.dark { ... }` block with:

```css
.dark {
  --bg-app:         #141920;
  --bg-surface:     #1c2333;
  --bg-toolbar:     var(--bg-surface);
  --bg-panel:       var(--bg-surface);
  --border:         #2d3748;
  --text-primary:   #f1f5f9;
  --text-secondary: #8899aa;
  --accent:         #3b82f6;
  --pitch-fill:     #2a5240;
  --pitch-alt:      #2f5c49;
  --pitch-lines:    rgba(255, 255, 255, 0.88);
}
```

- [ ] **Step 3: Update the `body` font**

Change the `body` rule's `font-family` from `'DM Mono', 'Space Mono', monospace` to:

```css
body {
  background-color: var(--bg-app);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 4: Verify (human step — run dev server)**

```bash
npm run dev
```

Open `http://localhost:5173`. The page background should be cool off-white (`#f0f2f5`). Toggle dark mode — should switch to deep charcoal (`#141920`). No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/index.css
git commit -m "feat: new colour system and Inter as base font"
```

---

## Chunk 2: colour.ts Utility + Player Token Redesign

### Task 4: Create the lightenColour utility

**Files:**
- Create: `tactic-board/src/utils/colour.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/utils/colour.ts

/**
 * Lighten a hex colour by blending it toward white.
 * Algorithm: each RGB channel = channel + (255 - channel) * amount
 *
 * @param hex    — 6-digit hex string, e.g. "#2563eb"
 * @param amount — 0 to 1 float (0 = original colour, 1 = white)
 * @returns      — 6-digit hex string of the lightened colour
 *
 * Example: lightenColour("#2563eb", 0.25) → approximately "#517ef0"
 */
export function lightenColour(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)

  const nr = Math.round(r + (255 - r) * amount)
  const ng = Math.round(g + (255 - g) * amount)
  const nb = Math.round(b + (255 - b) * amount)

  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/colour.ts
git commit -m "feat: add lightenColour utility for token gradient highlight"
```

Expected: clean commit with the new file, no errors.

---

### Task 5: Redesign PlayerToken with 3D bevel

**Files:**
- Modify: `tactic-board/src/components/board/PlayerToken.tsx`

- [ ] **Step 1: Read the current file**

Read `src/components/board/PlayerToken.tsx` in full before making changes.

- [ ] **Step 2: Add the lightenColour import**

At the top of the file, add:

```typescript
import { lightenColour } from '@/utils/colour'
```

- [ ] **Step 3: Replace the SVG content inside the `<g>` element**

Remove:
- The `{isSelected && <circle ... />}` selection ring (dashed ring is replaced by the glow filter)
- The existing `<circle r={16} .../>` body circle

**Do NOT remove** the `filter` property from the `<g>` element's `style` object. Keep it exactly as-is:
```tsx
filter: isDragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : undefined,
```
The drag shadow stays on `<g>` (it is a CSS filter, valid on an SVG group). The SVG `filter` attribute on the new body circle handles only the default shadow and the selected glow — it does not need an `isDragging` branch.

Replace the removed elements with:

```tsx
{/* Per-token SVG defs — IDs namespaced to prevent DOM collisions across 22 tokens */}
<defs>
  <radialGradient id={`grad-${player.id}`} cx="40%" cy="35%" r="65%">
    <stop offset="0%" stopColor={lightenColour(colour, 0.25)} />
    <stop offset="100%" stopColor={colour} />
  </radialGradient>
  <filter id={`shadow-${player.id}`} x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.4" />
  </filter>
  <filter id={`glow-${player.id}`} x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={colour} floodOpacity="0.85" />
  </filter>
</defs>

{/* Token body — stroke is unconditional; selection is communicated via glow filter only.
    Drag shadow is handled by the <g> style above — no isDragging branch needed here. */}
<circle
  r={16}
  fill={`url(#grad-${player.id})`}
  stroke="rgba(255,255,255,0.6)"
  strokeWidth={1.5}
  filter={isSelected ? `url(#glow-${player.id})` : `url(#shadow-${player.id})`}
/>

{/* Inner shimmer ring */}
<circle r={12} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
```

- [ ] **Step 4: Update the position label text element**

Update the position `<text>` to use Inter:

```tsx
{/* Position label */}
<text
  fontSize={11}
  fontWeight={800}
  fontFamily="Inter, sans-serif"
  fill="white"
  textAnchor="middle"
  dominantBaseline="central"
  style={{ pointerEvents: 'none', userSelect: 'none' }}
>
  {player.position}
</text>
```

- [ ] **Step 5: Update the player name text element**

```tsx
{/* Player name */}
<text
  y={25}
  fontSize={9}
  fontWeight={500}
  fontFamily="Inter, sans-serif"
  fill="rgba(255,255,255,0.9)"
  textAnchor="middle"
  dominantBaseline="hanging"
  style={{ pointerEvents: 'none', userSelect: 'none' }}
>
  {shortName}
</text>
```

- [ ] **Step 6: Verify visually**

With dev server running, open the app. All player tokens should show a subtle radial gradient highlight (lighter top-left, base colour bottom-right) with a drop shadow. Clicking a token should trigger a glow effect instead of a dashed ring. Dragging a token should show a stronger shadow.

- [ ] **Step 7: Commit**

```bash
git add src/components/board/PlayerToken.tsx
git commit -m "feat: 3D bevel player tokens with gradient, shadow, and glow-on-select"
```

> `colour.ts` was already committed in Task 4 — do not re-add it here.

---

## Chunk 3: Pitch + Layout Changes

### Task 6: Update PitchSVG stripe bands

**Files:**
- Modify: `tactic-board/src/components/board/PitchSVG.tsx`

- [ ] **Step 1: Read the current PitchSVG.tsx**

The stripes are **horizontal bands** (full pitch width, stacked vertically). The current `<pattern>` looks like this:

```svg
<pattern id="pitch-stripes" x="0" y="0" width="680" height="40" patternUnits="userSpaceOnUse">
  <rect x="0" y="0" width="680" height="20" fill="var(--pitch-fill)" />
  <rect x="0" y="20" width="680" height="20" fill="var(--pitch-alt)" />
</pattern>
```

Each band is 20 SVG units tall. We want to widen them to 32 SVG units each (total repeat 64 units ≈ 1.6× wider).

- [ ] **Step 2: Update the pattern**

Change:
- `height="40"` → `height="64"` on the `<pattern>` element
- First `<rect>`: `height="20"` → `height="32"`
- Second `<rect>`: `y="20"` → `y="32"` and `height="20"` → `height="32"`

Result:

```svg
<pattern id="pitch-stripes" x="0" y="0" width="680" height="64" patternUnits="userSpaceOnUse">
  <rect x="0" y="0" width="680" height="32" fill="var(--pitch-fill)" />
  <rect x="0" y="32" width="680" height="32" fill="var(--pitch-alt)" />
</pattern>
```

These are SVG viewBox units — the pitch viewBox is `0 0 680 1050`, so 32 units ≈ 3% of pitch height per band.

- [ ] **Step 3: Verify visually**

The pitch should show slightly wider horizontal alternating green bands. Pitch colour is matte emerald (`#3d6b52`) in light mode, deeper emerald (`#2a5240`) in dark mode. Lines should be crisper.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/PitchSVG.tsx
git commit -m "feat: widen pitch stripes to 32 SVG units each"
```

---

### Task 7: Move Toolbar inside main canvas area in App.tsx

**Files:**
- Modify: `tactic-board/src/App.tsx`

The Toolbar is currently rendered twice in `App.tsx` — once in a desktop-only wrapper and once in a mobile-only wrapper below `<main>`. For the floating pill to overlay the pitch canvas, the Toolbar must be a child of the `<main>` element (which fills the remaining height).

> **Note on BoardCanvas:** The spec lists `BoardCanvas.tsx` as a changed file (for `position: relative`), but checking the live file confirms the outermost wrapper div already has `className="relative flex items-center justify-center w-full h-full"`. No change to `BoardCanvas.tsx` is needed — it is already correctly set up.

- [ ] **Step 1: Read the current App.tsx**

Note the two toolbar wrappers:
```tsx
{/* Desktop toolbar */}
<div className="hidden md:block flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
  <Toolbar boardRef={boardRef} />
</div>

{/* Main content */}
<main className="flex flex-1 overflow-hidden">
  <BoardCanvas boardRef={boardRef} />
  <NotesPanel />
</main>

{/* Mobile bottom toolbar */}
<div className="md:hidden flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
  <Toolbar boardRef={boardRef} />
</div>
```

- [ ] **Step 2: Remove both toolbar wrappers and move Toolbar into main**

Replace the above block with:

```tsx
{/* Main content — Toolbar floats as an absolute pill inside this area */}
<main className="relative flex flex-1 overflow-hidden">
  <BoardCanvas boardRef={boardRef} />
  <NotesPanel />
  <Toolbar boardRef={boardRef} />
</main>
```

- Both old toolbar `<div>` wrappers are deleted.
- A single `<Toolbar>` is rendered inside `<main>`.
- `relative` is added to `<main>` so the pill's `position: absolute` anchors to it.

- [ ] **Step 3: Verify**

The toolbar should no longer appear as a top bar. It should float as a pill over the pitch. NotesPanel should still slide in from the right unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: move Toolbar inside main for floating pill positioning"
```

---

## Chunk 4: Floating Pill Toolbar

### Task 8: Redesign Toolbar as floating pill

**Files:**
- Modify: `tactic-board/src/components/layout/Toolbar.tsx`

- [ ] **Step 1: Read the current Toolbar.tsx in full**

Note the existing layout: a flex row with `height: 52`, `backgroundColor: var(--bg-toolbar)`. The Notes, Save, and Export buttons are inline JSX at the bottom of the component.

- [ ] **Step 2: Replace the outer wrapper div**

Replace the outer `<div className="flex items-center gap-2 px-3 overflow-x-auto flex-shrink-0" style={{ height: 52, backgroundColor: ... }}>` with:

```tsx
<div
  className="toolbar-pill absolute z-10 left-1/2 -translate-x-1/2 bottom-5 flex items-center gap-1.5 px-3"
  style={{
    height: 48,
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
    background: 'rgba(15, 23, 36, 0.82)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  }}
>
```

Mobile responsive behaviour is handled via the CSS class in the next step.

- [ ] **Step 3: Add the dark mode override, mobile styles, and backdrop-filter fallback in index.css**

In `src/styles/index.css`, add at the bottom:

```css
/* Toolbar pill */
.toolbar-pill {
  background: rgba(15, 23, 36, 0.82);
}

.dark .toolbar-pill {
  background: #1c2333;
  border-color: rgba(255, 255, 255, 0.08);
}

@supports not (backdrop-filter: blur(1px)) {
  .toolbar-pill {
    background: rgba(15, 23, 36, 0.96);
  }
}

/* Mobile pill — < 768px */
@media (max-width: 767px) {
  .toolbar-pill {
    left: 8px;
    right: 8px;
    transform: none;
    border-radius: 16px;
    overflow-x: auto;
    bottom: calc(8px + env(safe-area-inset-bottom));
  }
}
```

The `@media` rule overrides the `left-1/2 -translate-x-1/2` positioning at small viewports, spans the pill edge-to-edge with safe-area inset for iOS, and reduces the border-radius to 16px.

- [ ] **Step 4: Update the Notes toggle button icon**

Replace the hand-rolled SVG inside the Notes button with a Phosphor icon:

```tsx
import { NoteBlank } from '@phosphor-icons/react'

// Inside the button:
<NoteBlank size={18} weight="light" />
```

- [ ] **Step 5: Update the Save/Load button icon**

```tsx
import { FloppyDisk } from '@phosphor-icons/react'

// Inside the button:
<FloppyDisk size={18} weight="light" />
```

- [ ] **Step 6: Update button colours for the dark pill context**

Both the Notes and Save buttons currently use `color: 'var(--text-secondary)'` for inactive state. Inside the dark pill, update to:

```tsx
style={{
  width: 36, height: 36,
  background: isActive ? 'var(--accent)' : 'transparent',
  color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
  cursor: 'pointer',
  borderRadius: 8,
  transition: 'background 150ms ease, color 150ms ease',
}}
```

Apply the same pattern to both buttons. The Notes button `isActive` condition is `isNotesPanelOpen`.

- [ ] **Step 7: Update divider colours**

The existing divider `<div className="w-px self-stretch my-1.5" style={{ background: 'var(--border)' }} />` elements will be invisible inside the dark pill. Update all dividers to:

```tsx
<div className="w-px self-stretch my-1.5" style={{ background: 'rgba(255,255,255,0.12)' }} />
```

- [ ] **Step 8: Verify visually**

The toolbar should now float as a pill centered 20px above the bottom of the pitch canvas. On narrow viewports it should span full width. The toolbar should NOT appear over the header. Toggle dark mode — the pill should switch from the blurred dark glass to a solid `#1c2333` surface.

- [ ] **Step 9: Commit**

```bash
git add src/components/layout/Toolbar.tsx src/styles/index.css
git commit -m "feat: toolbar becomes floating glassmorphism pill"
```

---

## Chunk 5: Header + Icon Replacements

### Task 9: Redesign Header

**Files:**
- Modify: `tactic-board/src/components/layout/Header.tsx`

- [ ] **Step 1: Read the current Header.tsx**

Note the current height (48px), background, font family, and logo text ("Tactic Board").

- [ ] **Step 2: Update height, font, and logo text**

```tsx
<header
  className="flex items-center justify-between px-4 flex-shrink-0"
  style={{
    height: 44,
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
  }}
>
  <span
    className="font-semibold tracking-widest uppercase select-none"
    style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', letterSpacing: '0.12em' }}
  >
    Koach
  </span>
  <div className="flex items-center gap-1">
    <ShareButton />
    <ThemeToggle />
  </div>
</header>
```

- [ ] **Step 3: Verify**

Header should now read "KOACH" (uppercase via CSS `text-transform: uppercase` implied by the `uppercase` Tailwind class) in Inter semibold, **13px font size**, 44px header **height**, with Share and ThemeToggle on the right.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: update header to Koach branding, 44px, Inter font"
```

---

### Task 10: Replace icons in ThemeToggle

**Files:**
- Modify: `tactic-board/src/components/ui/ThemeToggle.tsx`

- [ ] **Step 1: Read the current ThemeToggle.tsx**

Note the hand-rolled SVG paths for sun and moon icons.

- [ ] **Step 2: Replace with Phosphor icons**

```tsx
import { Sun, Moon } from '@phosphor-icons/react'

// In the button render:
// When dark mode is active (showing sun to switch to light):
<Sun size={18} weight="light" />

// When light mode is active (showing moon to switch to dark):
<Moon size={18} weight="light" />
```

Keep the same click handler and `aria-label`. Only the icon JSX changes.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ThemeToggle.tsx
git commit -m "feat: use Phosphor Sun/Moon icons in ThemeToggle"
```

---

### Task 11: Replace icon in ShareButton

**Files:**
- Modify: `tactic-board/src/components/ui/ShareButton.tsx`

- [ ] **Step 1: Read ShareButton.tsx**

- [ ] **Step 2: Replace both SVG icons with Phosphor**

`ShareButton` has two icon states: default (share/link) and copied (checkmark shown for 2 seconds after click). Replace both:

```tsx
import { LinkSimple, Check } from '@phosphor-icons/react'

// Default state (copied === false):
<LinkSimple size={18} weight="light" />

// Copied state (copied === true):
<Check size={18} weight="light" />
```

The conditional rendering logic `{copied ? (...) : (...)}` stays the same — only the SVG content inside each branch changes.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ShareButton.tsx
git commit -m "feat: use Phosphor LinkSimple/Check icons in ShareButton"
```

---

### Task 12: Replace icons in UndoRedoButtons

**Files:**
- Modify: `tactic-board/src/components/toolbar/UndoRedoButtons.tsx`

- [ ] **Step 1: Read UndoRedoButtons.tsx**

- [ ] **Step 2: Replace SVGs with Phosphor**

```tsx
import { ArrowCounterClockwise, ArrowClockwise } from '@phosphor-icons/react'

// Undo button icon:
<ArrowCounterClockwise size={18} weight="light" />

// Redo button icon:
<ArrowClockwise size={18} weight="light" />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/toolbar/UndoRedoButtons.tsx
git commit -m "feat: use Phosphor undo/redo icons"
```

---

### Task 13: Replace icon in ExportButton

**Files:**
- Modify: `tactic-board/src/components/toolbar/ExportButton.tsx`

- [ ] **Step 1: Read ExportButton.tsx**

- [ ] **Step 2: Replace the SVG**

```tsx
import { DownloadSimple } from '@phosphor-icons/react'

// Replace icon with:
<DownloadSimple size={18} weight="light" />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/toolbar/ExportButton.tsx
git commit -m "feat: use Phosphor DownloadSimple icon in ExportButton"
```

---

## Chunk 6: Toolbar Sub-Components Active/Hover States

### Task 14: Update ModeToggle icons and states

**Files:**
- Modify: `tactic-board/src/components/toolbar/ModeToggle.tsx`

- [ ] **Step 1: Read the current ModeToggle.tsx**

Note the current active/inactive styling (uses `var(--accent)` for active).

- [ ] **Step 2: Replace icons**

```tsx
import { CursorClick, PencilSimple } from '@phosphor-icons/react'

// Select button icon:
<CursorClick size={18} weight="light" />

// Draw button icon:
<PencilSimple size={18} weight="light" />
```

- [ ] **Step 3: Update button styles to work inside the dark pill**

For both Select and Draw buttons, update the inactive colour from `var(--text-secondary)` to `rgba(255,255,255,0.55)` and hover to `rgba(255,255,255,0.85)`. Active state stays as `var(--accent)` background with `white` text. Border radius for these text-label buttons should be `999px`.

```tsx
style={{
  padding: '4px 12px',
  borderRadius: 999,
  background: isActive ? 'var(--accent)' : 'transparent',
  color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'Inter, sans-serif',
  transition: 'background 150ms ease, color 150ms ease',
  border: 'none',
}}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/toolbar/ModeToggle.tsx
git commit -m "feat: update ModeToggle with Phosphor icons and pill-context styles"
```

---

### Task 15: Update ArrowTypePicker hover/active states

**Files:**
- Modify: `tactic-board/src/components/toolbar/ArrowTypePicker.tsx`

- [ ] **Step 1: Read ArrowTypePicker.tsx**

There are two button groups: **arrow type** (run/pass/press) and **arrow style** (straight/curved). Both are currently wrapped in `<div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>`. Both groups need updating.

- [ ] **Step 2: Remove the border wrapper divs**

Replace both outer `<div className="flex rounded-lg overflow-hidden" style={{ border: ... }}>` wrappers with plain `<div className="flex items-center gap-0.5">` — the pill provides the container; individual buttons don't need a group border.

- [ ] **Step 3: Update all buttons in both groups**

For every button in both the arrow-type group and the arrow-style group, update the inline style:

```tsx
style={{
  minWidth: 44,
  minHeight: 36,
  padding: '4px 10px',
  borderRadius: 999,
  background: isActive ? 'var(--accent)' : 'transparent',
  color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
  transition: 'background 150ms ease, color 150ms ease',
}}
```

Where `isActive` is `arrowType === t` for type buttons and `arrowStyle === s` for style buttons.

- [ ] **Step 4: Commit**

```bash
git add src/components/toolbar/ArrowTypePicker.tsx
git commit -m "feat: update ArrowTypePicker styles for pill context"
```

---

### Task 16: Update FormationPicker styles

**Files:**
- Modify: `tactic-board/src/components/toolbar/FormationPicker.tsx`

- [ ] **Step 1: Read FormationPicker.tsx**

`FormationPicker` uses a native `<select>` element (not a custom button). Native `<select>` has limited CSS styling — background, colour, border, and font can be changed, but the dropdown appearance is OS-controlled and cannot use `border-radius: 999px` effectively on most browsers. The goal is to make it blend into the dark pill.

- [ ] **Step 2: Update the `<select>` element styles**

Replace the existing `style={{ ... }}` on the `<select>` with:

```tsx
style={{
  height: 36,
  padding: '0 8px',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: 'rgba(255,255,255,0.7)',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  appearance: 'auto',  // keep the OS dropdown arrow
}}
```

Also remove the `rounded` and `px-2 py-1 text-xs font-medium` Tailwind classes from the `<select>` element's `className` (they are now controlled by inline style).

- [ ] **Step 3: Update `<option>` elements**

The `<option>` elements inherit colour from the `<select>` and render in the OS dropdown. They do not need style changes — the OS dropdown background will match the system theme.

> **Safari/iOS note:** WebKit may partially override `background: transparent` on native `<select>` elements when `appearance: auto` is set. The result will look fine on Chrome/Firefox but may show a system-tinted control on Safari. This is an accepted limitation of styling native `<select>` elements without replacing them with a custom dropdown. Visual consistency on WebKit is best-effort only for this control.

- [ ] **Step 4: Commit**

```bash
git add src/components/toolbar/FormationPicker.tsx
git commit -m "feat: update FormationPicker styles for dark pill"
```

---

### Task 17: Update TeamColourPicker styles

**Files:**
- Modify: `tactic-board/src/components/toolbar/TeamColourPicker.tsx`

- [ ] **Step 1: Read TeamColourPicker.tsx**

- [ ] **Step 2: Ensure colour swatch buttons are visible on the dark pill**

The colour swatches (circles showing home/away team colours) should have a white border so they're visible against the dark pill background:

```tsx
style={{
  width: 20,
  height: 20,
  borderRadius: '50%',
  border: '2px solid rgba(255,255,255,0.4)',
  cursor: 'pointer',
  background: colour, // the team colour value
}}
```

No other functional changes needed.

- [ ] **Step 3: Commit**

```bash
git add src/components/toolbar/TeamColourPicker.tsx
git commit -m "feat: update TeamColourPicker swatch borders for dark pill"
```

---

## Chunk 7: Final Verification + Docs Update

### Task 18: Full visual verification pass

**Files:** None modified — verification only.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Light mode checklist**

Verify each item visually:
- [ ] Page background is cool off-white (`#f0f2f5`)
- [ ] Header reads "KOACH" in Inter, 44px tall
- [ ] Pitch is matte emerald with wide stripes and crisp white lines
- [ ] Toolbar is a floating pill 20px above pitch bottom, blurred glass effect
- [ ] All toolbar icons are thin-line Phosphor style
- [ ] Player tokens have visible gradient highlight (lighter top-left corner)
- [ ] Clicking a token shows a glow, not a dashed ring
- [ ] Dragging a token shows a stronger drop shadow

- [ ] **Step 3: Dark mode checklist**

Toggle dark mode and verify:
- [ ] Background switches to deep charcoal (`#141920`)
- [ ] Toolbar pill becomes solid `#1c2333` (no blurred glass — it's already dark)
- [ ] Pitch becomes deeper emerald (`#2a5240`)
- [ ] All text remains legible

- [ ] **Step 4: Mobile checklist (DevTools device simulation)**

Set viewport to 375px wide and verify:
- [ ] Toolbar pill spans nearly full width, pinned to bottom
- [ ] Pitch fills the width
- [ ] All pill buttons are at least 44px tall / accessible

- [ ] **Step 5: Run build to catch TypeScript errors**

```bash
npm run build
```

Expected: clean build with no TypeScript errors.

- [ ] **Step 6: Commit if any minor fixes were needed**

```bash
git add -p
git commit -m "fix: visual verification tweaks"
```

---

### Task 19: Update 04-ui-design.md to match new system

**Files:**
- Modify: `04-ui-design.md` — located at the **workspace root** (`C:\Users\Keita\Documents\Dev Ops\Tactik\04-ui-design.md`), one level above `tactic-board/`. Not inside the `tactic-board/` folder.

- [ ] **Step 1: Update the Design Philosophy section**

Change the typography line from:
> `DM Mono` or `Space Mono` — monospace for a technical, data-driven feel

To:
> `Inter` — clean geometric sans-serif for UI. `DM Mono` retained for notes panel textarea only.

- [ ] **Step 2: Update the Colour System section**

Replace the light/dark mode CSS blocks to match the new values from the spec (Section 1 of the design spec at `docs/superpowers/specs/2026-03-16-ui-redesign-design.md`).

- [ ] **Step 3: Update the Layout section**

Update the ASCII layout diagram to show the floating pill toolbar instead of the top toolbar bar.

- [ ] **Step 4: Commit**

```bash
git -C "C:\Users\Keita\Documents\Dev Ops\Tactik" add 04-ui-design.md
git -C "C:\Users\Keita\Documents\Dev Ops\Tactik" commit -m "docs: update 04-ui-design.md to reflect new Koach design system"
```

---

### Task 20: Update CLAUDE.md project name

**Files:**
- Modify: `CLAUDE.md` — also at the **workspace root** (`C:\Users\Keita\Documents\Dev Ops\Tactik\CLAUDE.md`), same level as `04-ui-design.md`

- [ ] **Step 1: Update the project name**

In `CLAUDE.md`, change:
- `**Name:** Tactic Board` → `**Name:** Koach`
- Any other references to "Tactic Board" in the identity section

- [ ] **Step 2: Commit**

```bash
git -C "C:\Users\Keita\Documents\Dev Ops\Tactik" add CLAUDE.md
git -C "C:\Users\Keita\Documents\Dev Ops\Tactik" commit -m "docs: rename project to Koach in CLAUDE.md"
```
