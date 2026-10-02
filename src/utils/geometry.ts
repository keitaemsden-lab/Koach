import type { Arrow, Player, Point, SerializableState } from '@/store/types'

/** Canonical pitch in portrait units: 10 units = 1 metre. */
export const PITCH_W = 680
export const PITCH_L = 1050

/** Margin around the pitch inside the SVG viewBox (goals and touchline breathing room). */
export function viewMargin(land: boolean) {
  return land ? 30 : 23
}

export function viewBox(land: boolean) {
  const m = viewMargin(land)
  const w = (land ? PITCH_L : PITCH_W) + 2 * m
  const h = (land ? PITCH_W : PITCH_L) + 2 * m
  return { x: -m, y: -m, w, h, str: `${-m} ${-m} ${w} ${h}` }
}

/**
 * Landscape view: home goal on the left, home attacking right.
 * View X = PITCH_L - y, view Y = x. As an SVG matrix: matrix(0 1 -1 0 PITCH_L 0).
 */
export const LANDSCAPE_MATRIX = `matrix(0 1 -1 0 ${PITCH_L} 0)`

export function toView(p: Point, land: boolean): Point {
  return land ? { x: PITCH_L - p.y, y: p.x } : { x: p.x, y: p.y }
}

export function toPortrait(v: Point, land: boolean): Point {
  return land ? { x: v.y, y: PITCH_L - v.x } : { x: v.x, y: v.y }
}

/** A delta measured in view units, expressed in portrait units. */
export function deltaToPortrait(d: Point, land: boolean): Point {
  return land ? { x: d.y, y: -d.x } : { x: d.x, y: d.y }
}

/** Should the pitch lie landscape in a box of this size? Matches the preview: wider than 1.15:1. */
export function prefersLandscape(width: number, height: number) {
  return width / Math.max(1, height) > 1.15
}

export const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

export function clampToPitch(p: Point): Point {
  return { x: clamp(p.x, -15, PITCH_W + 15), y: clamp(p.y, -15, PITCH_L + 15) }
}

// ─── Legacy migration ───────────────────────────────────────────────────────

/**
 * Boards saved before the redesign stored landscape boards in landscape coordinates
 * (x up to 1050). Portrait boards never pass x 690, so any point past that marks landscape.
 */
export function looksLandscape(state: Pick<SerializableState, 'players' | 'arrows'>) {
  const xs: number[] = []
  for (const p of state.players ?? []) xs.push(p.x)
  for (const a of state.arrows ?? []) {
    xs.push(a.start.x, a.end.x)
    if (a.control) xs.push(a.control.x)
  }
  return xs.some((x) => x > 690)
}

/** Old landscape transform was {x: p.y, y: 680 - p.x}; this is its inverse. */
function fromLegacyLandscape(p: Point): Point {
  return { x: PITCH_W - p.y, y: p.x }
}

/** Bring any stored board (current, legacy portrait or legacy landscape) to canonical form. */
export function normaliseState(state: SerializableState): SerializableState {
  const players = Array.isArray(state.players) ? state.players : []
  const arrows = Array.isArray(state.arrows) ? state.arrows : []
  const legacyLand = state.orientation !== 'portrait' && looksLandscape({ players, arrows })
  const fix = (p: Point) => (legacyLand ? fromLegacyLandscape(p) : p)
  return {
    ...state,
    players: players.map((p) => ({ ...p, ...fix(p) })),
    arrows: arrows.map((a) => ({
      ...a,
      start: fix(a.start),
      end: fix(a.end),
      control: a.control ? fix(a.control) : undefined,
    })),
    notes: typeof state.notes === 'string' ? state.notes : '',
    orientation: 'portrait',
  }
}

// ─── Arrow geometry (portrait units) ───────────────────────────────────────

export function arrowStart(a: Arrow, players?: Player[]): Point {
  if (a.fromId && players) {
    const p = players.find((q) => q.id === a.fromId)
    if (p) return { x: p.x, y: p.y }
  }
  return a.start
}

function hasCurve(a: Arrow) {
  return a.style === 'curved' && !!a.control
}

/** Point at t (0..1) along the arrow, following its curve. */
export function along(a: Arrow, t: number, start: Point = a.start): Point {
  const e = a.end
  if (hasCurve(a)) {
    const c = a.control!
    const u = 1 - t
    return {
      x: u * u * start.x + 2 * u * t * c.x + t * t * e.x,
      y: u * u * start.y + 2 * u * t * c.y + t * t * e.y,
    }
  }
  return { x: start.x + (e.x - start.x) * t, y: start.y + (e.y - start.y) * t }
}

const r2 = (n: number) => Math.round(n * 100) / 100

/** SVG path for an arrow: run and pass follow the curve; press is a zigzag along it. */
export function arrowPathD(a: Arrow, start: Point = a.start): string {
  const e = a.end
  if (a.type === 'press') {
    // sample the curve, then zigzag across it every 13 units, leaving a straight tail for the head
    const N = 48
    const pts: Point[] = []
    for (let i = 0; i <= N; i++) pts.push(along(a, i / N, start))
    const acc = [0]
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y))
    const total = acc[acc.length - 1]
    const n = Math.max(0, Math.floor((total - 30) / 13))
    let d = `M${r2(start.x)} ${r2(start.y)}`
    let j = 1
    for (let i = 1; i <= n; i++) {
      const s = 13 * i
      while (j < acc.length - 1 && acc[j] < s) j++
      const seg = acc[j] - acc[j - 1] || 1
      const f = (s - acc[j - 1]) / seg
      const px = pts[j - 1].x + (pts[j].x - pts[j - 1].x) * f
      const py = pts[j - 1].y + (pts[j].y - pts[j - 1].y) * f
      const ux = (pts[j].x - pts[j - 1].x) / seg, uy = (pts[j].y - pts[j - 1].y) / seg
      const o = i % 2 ? 7.5 : -7.5
      d += `L${r2(px - uy * o)} ${r2(py + ux * o)}`
    }
    return d + `L${r2(e.x)} ${r2(e.y)}`
  }
  if (hasCurve(a)) {
    const c = a.control!
    return `M${r2(start.x)} ${r2(start.y)}Q${r2(c.x)} ${r2(c.y)} ${r2(e.x)} ${r2(e.y)}`
  }
  return `M${r2(start.x)} ${r2(start.y)}L${r2(e.x)} ${r2(e.y)}`
}

/** Where the numbered step badge sits: beside the line at 40% of its length, offset to one side. */
export function badgePoint(a: Arrow, offset: number, start: Point = a.start): Point {
  const p1 = along(a, 0.38, start), p2 = along(a, 0.42, start)
  const d = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1
  return { x: p1.x - ((p2.y - p1.y) / d) * offset, y: p1.y + ((p2.x - p1.x) / d) * offset }
}

/** Fit a quadratic control point to a freehand stroke (the preview's draw gesture). */
export function controlFromStroke(pts: Point[]): Point | undefined {
  if (pts.length < 3) return undefined
  const s = pts[0], e = pts[pts.length - 1]
  let tot = 0
  const acc = [0]
  for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); acc.push(tot) }
  const mi = acc.findIndex((v) => v >= tot / 2)
  const m = pts[Math.max(0, mi)]
  const c = { x: 2 * m.x - (s.x + e.x) / 2, y: 2 * m.y - (s.y + e.y) / 2 }
  if (Math.hypot(c.x - (s.x + e.x) / 2, c.y - (s.y + e.y) / 2) <= 8) return undefined
  return { x: r2(c.x), y: r2(c.y) }
}

/** Nearest player to a point within a radius (portrait units). */
export function playerAt(players: Player[], p: Point, radius: number): Player | null {
  let best: Player | null = null
  let bd = radius
  for (const q of players) {
    const d = Math.hypot(q.x - p.x, q.y - p.y)
    if (d <= bd) { bd = d; best = q }
  }
  return best
}

/** Text colour (ink or chalk) that reads on a kit colour. */
export function inkOn(hex: string): string {
  const h = hex.replace('#', '')
  if (h.length < 6) return '#0A0F0C'
  const ch = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4)
  // contrast against near-black ink vs near-white chalk
  const vsInk = (L + 0.05) / (0.0056 + 0.05)
  const vsChalk = (0.88 + 0.05) / (L + 0.05)
  return vsInk >= vsChalk ? '#0A0F0C' : '#EEF2EA'
}

/** Whose ink an arrow is drawn in. Boards from before the redesign only stored a hex colour. */
export function arrowInk(a: Arrow, homeColour: string, awayColour: string): 'home' | 'away' | 'neutral' {
  if (a.team) return a.team
  const c = (a.teamColour || '').toLowerCase()
  if (c && c === homeColour.toLowerCase()) return 'home'
  if (c && c === awayColour.toLowerCase()) return 'away'
  return 'neutral'
}
