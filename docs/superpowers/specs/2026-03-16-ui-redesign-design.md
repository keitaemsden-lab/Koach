# UI Redesign — Design Spec
**Date:** 2026-03-16
**Status:** Approved (post-review)

---

## Overview

Full visual redesign of the Tactic Board app. Goal: elevate from functional MVP to a premium, elite sports analytics aesthetic — think Nike, Apple Fitness, modern broadcast graphics. All existing functionality is preserved; this is a pure UI/UX upgrade.

**Approach chosen:** Full Redesign (Option 2) — CSS, layout, tokens, icons all updated in one pass.

---

## 1. Color System

### Light Mode (default on first load)

```css
:root {
  --bg-app:         #f0f2f5;   /* cool off-white */
  --bg-surface:     #ffffff;   /* replaces --bg-toolbar and --bg-panel */
  --border:         #e4e7ec;
  --text-primary:   #0f172a;
  --text-secondary: #6b7280;
  --accent:         #2563eb;   /* electric blue */
  --pitch-fill:     #3d6b52;   /* matte emerald */
  --pitch-alt:      #446059;   /* cooler stripe band */
  --pitch-lines:    rgba(255, 255, 255, 0.92);

  /* Backwards-compat aliases — remove once all components are updated */
  --bg-toolbar: var(--bg-surface);
  --bg-panel:   var(--bg-surface);
}
```

### Dark Mode

```css
.dark {
  --bg-app:         #141920;   /* deep charcoal */
  --bg-surface:     #1c2333;
  --border:         #2d3748;
  --text-primary:   #f1f5f9;
  --text-secondary: #8899aa;
  --accent:         #3b82f6;
  --pitch-fill:     #2a5240;   /* deeper emerald */
  --pitch-alt:      #2f5c49;
  --pitch-lines:    rgba(255, 255, 255, 0.88);

  --bg-toolbar: var(--bg-surface);
  --bg-panel:   var(--bg-surface);
}
```

> **Note on variable migration:** `--bg-toolbar` and `--bg-panel` are kept as aliases pointing to `--bg-surface`. All components may continue using the old names without breakage. New components should use `--bg-surface`.
>
> **Note on pill vs panel colours:** The floating Toolbar pill uses hardcoded colour values (`rgba(15,23,36,0.82)` in light mode, `#1c2333` in dark mode) rather than `--bg-surface`. This is intentional — the pill sits over the pitch and needs guaranteed contrast regardless of theme. Panels such as `NotesPanel` and `SaveLoadModal` correctly use `--bg-surface` (via the `--bg-panel` alias) and will have a different, lighter surface colour than the pill. Do not attempt to unify them.

### Team Colours (unchanged)
- Home default: `#2563eb`
- Away default: `#dc2626`

### Arrow Colours (unchanged)
- Run: team colour
- Pass: `#f59e0b`
- Press: `#ef4444` (dashed)

---

## 2. Typography

| Context | Font | Weight | Size |
|---|---|---|---|
| UI chrome (toolbar, header, modals) | Inter | 400–600 | 13–14px |
| Toolbar button labels | Inter | 500 | 12px |
| Player token — position label | Inter | 800 | 11px |
| Player token — name | Inter | 500 | 9px |
| Notes textarea | DM Mono | 400 | 13px |
| Modal headings | Inter | 600 | 16px |

**Google Fonts import in `index.html`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=DM+Mono:wght@400&display=swap" rel="stylesheet">
```

Both Inter and DM Mono are loaded from Google Fonts in a single request. `display=swap` prevents FOIT on both. Body font in `index.css` changes from `DM Mono` to `Inter`. DM Mono is retained only for the notes textarea via `font-family: 'DM Mono', monospace`.

> **Note:** This intentionally reverses the existing `04-ui-design.md` typography spec (which used DM Mono for UI and Inter for tokens). The new direction uses Inter for all UI chrome and demotes DM Mono to the notes panel only. `04-ui-design.md` should be updated to match after implementation.

---

## 3. Icons

Install: `npm install @phosphor-icons/react`

Replace all hand-rolled SVG icons in toolbar and header components with Phosphor Icons.

**Icon mapping:**

| Button | Phosphor component | Size |
|---|---|---|
| Select mode | `CursorClick` | 18 |
| Draw mode | `PencilSimple` | 18 |
| Undo | `ArrowCounterClockwise` | 18 |
| Redo | `ArrowClockwise` | 18 |
| Notes | `NoteBlank` | 18 |
| Save/Load | `FloppyDisk` | 18 |
| Export PNG | `DownloadSimple` | 18 |
| Share | `LinkSimple` | 18 |
| Dark mode | `Moon` | 18 |
| Light mode | `Sun` | 18 |
| Delete arrow (inline) | `X` | 14 |

All icons use `weight="light"` for the thin-line aesthetic.

---

## 4. Layout

### Desktop (≥ 768px)

```
┌──────────────────────────────────────────┐
│  HEADER  44px                            │
│  [Tactic Board]           [Share][Theme] │
├──────────────────────────────────────────┤
│                                          │
│           PITCH CANVAS                   │
│           (fills remaining height)       │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │      FLOATING PILL TOOLBAR       │   │
│   └──────────────────────────────────┘   │
│              ↑ 20px from bottom          │
└──────────────────────────────────────────┘
```

`BoardCanvas` wrapper gets `position: relative`. The `Toolbar` becomes `position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10`.

**Pill styles (light mode — pill is dark for pitch contrast):**
```css
background: rgba(15, 23, 36, 0.82);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 999px;
padding: 6px 12px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
```

**Pill styles (dark mode — solid surface):**
```css
background: #1c2333;   /* --bg-surface in dark mode, fully opaque */
border: 1px solid rgba(255, 255, 255, 0.08);
```

**Fallback for browsers without `backdrop-filter` support:**
```css
@supports not (backdrop-filter: blur(1px)) {
  .toolbar-pill {
    background: rgba(15, 23, 36, 0.96);  /* fully opaque fallback */
  }
}
```

### Mobile (< 768px)

```css
position: absolute;
left: 8px;
right: 8px;
bottom: calc(8px + env(safe-area-inset-bottom));
transform: none;
border-radius: 16px;
overflow-x: auto;
```

Notes panel remains a bottom sheet (unchanged from MVP).

### Pill Contents (left → right)

```
[Select | Draw]  |  [Run | Pass | Press — draw mode only]  |  [Formation ▾]  |  [Home ● Away ●]  |  [↩ ↪]  |  [Notes] [Save] [Export]
```

Notes, Save, and Export are **inline buttons within `Toolbar.tsx`** — not separate component files. They currently exist as anonymous JSX in `Toolbar.tsx` and will be updated in place.

Dividers: `1px` vertical line, `rgba(255,255,255,0.12)`, `self-stretch my-1.5`.

---

## 5. Header

- Height: 44px (from 48px)
- Background: `var(--bg-surface)` with `border-bottom: 1px solid var(--border)`
- Logo: `"KOACH"` — Inter 600, 13px, `letter-spacing: 0.12em`, uppercase
- Right side: `ShareButton` + `ThemeToggle`, both updated to Phosphor icons

---

## 6. Player Tokens

### SVG Structure

All gradient and filter `id` values are namespaced per player to prevent DOM collisions across 22 tokens.

```jsx
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

{/* Body */}
<circle
  r={16}
  fill={`url(#grad-${player.id})`}
  stroke="rgba(255,255,255,0.6)"
  strokeWidth={1.5}
  filter={isDragging
    ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
    : isSelected
      ? `url(#glow-${player.id})`
      : `url(#shadow-${player.id})`}
/>

{/* Inner shimmer ring */}
<circle r={12} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

{/* Position label */}
<text fontSize={11} fontWeight={800} fontFamily="Inter, sans-serif"
  fill="white" textAnchor="middle" dominantBaseline="central">
  {player.position}
</text>

{/* Player name */}
<text y={25} fontSize={9} fontWeight={500} fontFamily="Inter, sans-serif"
  fill="rgba(255,255,255,0.9)" textAnchor="middle" dominantBaseline="hanging">
  {shortName}
</text>
```

**Selected state:** glow filter active, `stroke="white"` at full opacity. No dashed ring.

### `lightenColour` Utility

File: `src/utils/colour.ts`

**Algorithm:** RGB white-mix. Each channel is interpolated toward 255 by `amount` using `Math.round(channel + (255 - channel) * amount)`. This is equivalent to mixing with white at `amount` ratio.

```ts
/**
 * Lighten a hex colour by blending it toward white.
 * Algorithm: each RGB channel = channel + (255 - channel) * amount
 * @param hex    — 6-digit hex string, e.g. "#2563eb"
 * @param amount — 0 to 1 float (0 = original colour, 1 = white)
 * @returns      — 6-digit hex string of the lightened colour
 *
 * Example: lightenColour("#2563eb", 0.25) → approximately "#517ef0"
 */
export function lightenColour(hex: string, amount: number): string
```

Called in `PlayerToken.tsx` as the `offset="0%"` stop of the radial gradient. The `amount` value of `0.25` is appropriate for all standard team colours without washing out dark shades.

---

## 7. PitchSVG Updates

- CSS variables updated per Section 1 (no direct changes needed in `PitchSVG.tsx` itself — it reads `var(--pitch-fill)` etc. via CSS)
- Stripe pattern `<pattern>` width: widen bands from 5 to 8 **SVG viewBox units** each (16 SVG units total pattern width) for better readability at small viewport sizes. These are viewBox units, not CSS pixels — the pattern is inside a `viewBox="0 0 680 1050"` SVG and must scale proportionally. Change is in `PitchSVG.tsx`.

---

## 8. Toolbar Button Style

All toolbar buttons (including those in `FormationPicker.tsx` and `TeamColourPicker.tsx`) use these states:

**Active:**
```css
background: var(--accent);
color: white;
border-radius: 999px;
```

**Inactive:**
```css
background: transparent;
color: rgba(255, 255, 255, 0.55);
```

**Hover:**
```css
background: rgba(255, 255, 255, 0.08);
color: rgba(255, 255, 255, 0.85);
```

Border radius on icon-only buttons: `8px`. Border radius on text/pill buttons (Select, Draw, formation name): `999px`.

---

## 9. Files Changed

| File | Change type |
|---|---|
| `index.html` | Add Inter + DM Mono Google Fonts import with display=swap |
| `src/styles/index.css` | New CSS variables, body font → Inter, alias old vars |
| `package.json` | Add `@phosphor-icons/react` |
| `src/utils/colour.ts` | **New file** — `lightenColour` utility |
| `src/components/board/PlayerToken.tsx` | 3D bevel SVG, namespaced defs, glow on select |
| `src/components/board/BoardCanvas.tsx` | Add `position: relative` to wrapper |
| `src/components/board/PitchSVG.tsx` | Widen stripe bands to 8px |
| `src/components/layout/Header.tsx` | 44px height, Phosphor icons, Inter font |
| `src/components/layout/Toolbar.tsx` | Absolute pill positioning, Phosphor icons for Notes/Save buttons |
| `src/components/toolbar/ModeToggle.tsx` | Phosphor icons, updated active/hover states |
| `src/components/toolbar/ArrowTypePicker.tsx` | Updated active/hover states |
| `src/components/toolbar/FormationPicker.tsx` | Updated active/hover states |
| `src/components/toolbar/TeamColourPicker.tsx` | Updated active/hover states |
| `src/components/toolbar/UndoRedoButtons.tsx` | Phosphor icons |
| `src/components/toolbar/ExportButton.tsx` | Phosphor icon |
| `src/components/ui/ShareButton.tsx` | Phosphor icon |
| `src/components/ui/ThemeToggle.tsx` | Phosphor icons (Sun/Moon) |

> **Not changed:** `SaveLoadModal.tsx`, `NotesPanel.tsx`, `PlayerEditPopover.tsx`, `Popover.tsx`, `Modal.tsx`, `Button.tsx`, `ArrowLayer.tsx`, `ArrowElement.tsx`, `DrawingOverlay.tsx` — these continue using `var(--bg-toolbar)` / `var(--bg-panel)` which are kept as aliases and will render correctly without modification.

---

## 10. Out of Scope

- No changes to store, hooks, or business logic
- No changes to arrow rendering (colours/shapes/logic stay)
- No changes to SaveLoadModal or NotesPanel internals
- No new features
