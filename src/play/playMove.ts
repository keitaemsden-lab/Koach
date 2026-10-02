/**
 * Play the move (Floodlight's signature gesture): telestrator ink wipes along each numbered
 * arrow in order while its runner travels it under a yellow spotlight ring, the ball rides each
 * pass, then the shape settles back. Reduced motion shows one still frame of the end positions
 * until Back is pressed.
 *
 * The board store is never written during playback (so undo history stays clean); the engine
 * moves the rendered player nodes directly and puts every attribute back when it finishes.
 */
import type { Arrow, Player, Point } from '@/store/types'
import { along, playerAt, toView } from '@/utils/geometry'
import { useBoardStore } from '@/store/boardStore'
import { useUI, toast } from '@/store/uiStore'
import { boardDom } from './boardDom'
import { prefersReducedMotion } from '@/hooks/useMedia'

export const STEP_GAP_MS = 700
export const WIPE_MS = 380
export const HOLD_MS = 1100
export const RETURN_MS = 560
export const PRESS_REACH = 0.82

export type Step = {
  arrow: Arrow                 // start frozen where the move begins
  index: number
  runnerId: string | null      // null: the ball travels (passes, or arrows nobody stands on)
  reach: number
  delay: number
  travelMs: number
}

/** Who runs which arrow, in what order and for how long. Pure: tested directly. */
export function planMove(arrows: Arrow[], players: Player[]): Step[] {
  return arrows.map((a, i) => {
    const owner = (a.fromId && players.find((p) => p.id === a.fromId)) || playerAt(players, a.start, 30)
    const start = owner ? { x: owner.x, y: owner.y } : a.start
    const runner = a.type === 'pass' ? null : owner
    return {
      arrow: { ...a, start },
      index: i,
      runnerId: runner ? runner.id : null,
      reach: a.type === 'press' ? PRESS_REACH : 1,
      delay: i * STEP_GAP_MS,
      travelMs: a.type === 'pass' || !runner ? 620 : a.type === 'press' ? 640 : 1000,
    }
  })
}

/** The still frame: where every runner ends and where each ball lands. */
export function endFrame(steps: Step[]) {
  const positions = new Map<string, Point>()
  const balls: Point[] = []
  for (const s of steps) {
    const end = along(s.arrow, s.reach, s.arrow.start)
    if (s.runnerId) positions.set(s.runnerId, end)
    else balls.push(end)
  }
  return { positions, balls }
}

/** Total running time of the move before it holds and settles back. */
export function moveDuration(steps: Step[]) {
  return steps.reduce((m, s) => Math.max(m, s.delay + WIPE_MS + s.travelMs), 0)
}

// ─── easing: the direction's two curves ─────────────────────────────────────

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const B = (u: number, a: number, b: number) => 3 * (1 - u) * (1 - u) * u * a + 3 * (1 - u) * u * u * b + u * u * u
  return (t: number) => {
    if (t <= 0) return 0
    if (t >= 1) return 1
    let lo = 0, hi = 1, u = t
    for (let i = 0; i < 22; i++) { u = (lo + hi) / 2; if (B(u, x1, x2) < t) lo = u; else hi = u }
    return B(u, y1, y2)
  }
}
export const QUINT = bezier(0.22, 1, 0.36, 1)

// ─── runtime ─────────────────────────────────────────────────────────────────

const NS = 'http://www.w3.org/2000/svg'
type Run = { stop: boolean }
let current: Run | null = null
let restoreFns: (() => void)[] = []

const phase = () => useUI.getState().playPhase
export const isPlaying = () => phase() !== 'idle'

function tween(run: Run, dur: number, delay: number, fn: (e: number) => void, ease = QUINT) {
  return new Promise<void>((res) => {
    if (dur <= 0) { fn(1); res(); return }
    let t0: number | null = null
    const step = (now: number) => {
      if (run.stop) { res(); return }
      if (t0 === null) t0 = now + delay
      const t = Math.min(1, Math.max(0, (now - t0) / dur))
      if (now >= t0) fn(ease(t))
      if (t < 1) requestAnimationFrame(step); else res()
    }
    requestAnimationFrame(step)
  })
}

const wait = (run: Run, ms: number) => new Promise<void>((res) => {
  const t = setTimeout(res, ms)
  if (run.stop) { clearTimeout(t); res() }
})

function nodeFor(svg: SVGSVGElement, id: string) {
  return svg.querySelector<SVGGElement>(`[data-player-id="${id}"]`)
}

function place(el: SVGGElement, p: Point) {
  const v = toView(p, boardDom.land)
  el.style.transform = `translate(${v.x}px, ${v.y}px)`
}

function fxLayer(svg: SVGSVGElement, which: 'under' | 'over') {
  return svg.querySelector<SVGGElement>(`.fx-${which}`)
}

function addCircle(layer: SVGGElement | null, cls: string, r: number, p: Point) {
  const c = document.createElementNS(NS, 'circle')
  c.setAttribute('class', cls)
  c.setAttribute('r', String(r))
  const v = toView(p, boardDom.land)
  c.setAttribute('cx', String(v.x))
  c.setAttribute('cy', String(v.y))
  layer?.appendChild(c)
  restoreFns.push(() => c.remove())
  return c
}

/** Remember a player's rendered transform so it can be put back exactly. */
function hold(el: SVGGElement) {
  const before = el.style.transform
  restoreFns.push(() => { el.style.transform = before })
}

function restoreAll() {
  const fns = restoreFns
  restoreFns = []
  for (const f of fns.reverse()) f()
}

function begin(next: 'running' | 'held') {
  const { selectPlayer, setDrawingState } = useBoardStore.getState()
  selectPlayer(null)
  setDrawingState(null)
  useUI.getState().setPlayPhase(next)
}

function finish() {
  restoreAll()
  current = null
  useUI.getState().setPlayPhase('idle')
}

/** Play button and P: play, stop a running move, or step back from the still frame. */
export function togglePlay() {
  const p = phase()
  if (p === 'running') { if (current) current.stop = true; return }
  if (p === 'held') { finish(); return }
  if (p === 'returning') return
  const svg = boardDom.svg
  const { arrows, players } = useBoardStore.getState()
  if (!arrows.length) { toast('Draw a run first, then play it'); return }
  if (!svg) return
  const steps = planMove(arrows, players)
  if (prefersReducedMotion()) playStill(svg, steps)
  else void playMotion(svg, steps, players)
}

/** Stop anything in flight and restore the board immediately (layout change, unmount). */
export function stopPlayback() {
  if (current) current.stop = true
  if (phase() !== 'idle') finish()
}

function playStill(svg: SVGSVGElement, steps: Step[]) {
  begin('held')
  const { positions, balls } = endFrame(steps)
  for (const [id, p] of positions) {
    const el = nodeFor(svg, id)
    if (!el) continue
    hold(el)
    place(el, p)
  }
  const r = 6 / (boardDom.scale || 0.5)
  for (const b of balls) addCircle(fxLayer(svg, 'over'), 'ball', r, b).setAttribute('stroke-width', String(r / 3))
}

async function playMotion(svg: SVGSVGElement, steps: Step[], players: Player[]) {
  const run: Run = { stop: false }
  current = run
  begin('running')
  const ppu = boardDom.scale || 0.5
  // every runner's rendered transform is restored at the end, whatever happens
  const runners = new Set(steps.map((s) => s.runnerId).filter(Boolean) as string[])
  for (const id of runners) { const el = nodeFor(svg, id); if (el) hold(el) }

  const lines = steps.map((s) => svg.querySelector<SVGPathElement>(`[data-arrow-id="${s.arrow.id}"] .ln`))
  lines.forEach((ln, i) => {
    if (!ln) return
    const marker = ln.getAttribute('marker-end')
    ln.removeAttribute('marker-end')
    // hidden until its wipe starts (a round cap would otherwise leave a dot at the far end)
    ln.style.opacity = '0'
    if (steps[i].arrow.type !== 'pass') { ln.style.strokeDasharray = '1 1'; ln.style.strokeDashoffset = '1' }
    restoreFns.push(() => {
      if (marker) ln.setAttribute('marker-end', marker)
      ln.style.strokeDasharray = ''; ln.style.strokeDashoffset = ''; ln.style.opacity = ''
    })
  })

  const jobs = steps.map(async (s, i) => {
    const ln = lines[i]
    await tween(run, WIPE_MS, s.delay, (e) => {
      if (!ln) return
      if (s.arrow.type !== 'pass') { ln.style.opacity = ''; ln.style.strokeDashoffset = String(1 - e) }
      else ln.style.opacity = String(e)
      if (e >= 1) { const m = `url(#ah-${s.arrow.team ?? 'home'})`; ln.setAttribute('marker-end', m) }
    })
    if (!s.runnerId) {
      const ball = addCircle(fxLayer(svg, 'over'), 'ball', 6 / ppu, s.arrow.start)
      ball.setAttribute('stroke-width', String(2 / ppu))
      await tween(run, s.travelMs, 0, (e) => {
        const v = toView(along(s.arrow, e, s.arrow.start), boardDom.land)
        ball.setAttribute('cx', String(v.x)); ball.setAttribute('cy', String(v.y))
      })
      return
    }
    const el = nodeFor(svg, s.runnerId)
    if (!el) return
    const spot = addCircle(fxLayer(svg, 'under'), 'spotlight', 34 / ppu, s.arrow.start)
    spot.setAttribute('stroke-width', String(1.6 / ppu))
    await tween(run, s.travelMs, 0, (e) => {
      const p = along(s.arrow, e * s.reach, s.arrow.start)
      place(el, p)
      const v = toView(p, boardDom.land)
      spot.setAttribute('cx', String(v.x)); spot.setAttribute('cy', String(v.y))
    })
    if (!run.stop) spot.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 300, fill: 'forwards' })
  })
  await Promise.all(jobs)
  if (!run.stop) await wait(run, HOLD_MS)

  if (!run.stop) {
    // the shape settles back to where the board says it is
    useUI.getState().setPlayPhase('returning')
    await Promise.all([...runners].map((id) => {
      const el = nodeFor(svg, id)
      const home = players.find((p) => p.id === id)
      const last = steps.filter((s) => s.runnerId === id).pop()
      if (!el || !home || !last) return null
      const from = along(last.arrow, last.reach, last.arrow.start)
      return tween(run, RETURN_MS, 0, (e) => place(el, { x: from.x + (home.x - from.x) * e, y: from.y + (home.y - from.y) * e }))
    }))
  }
  if (current === run) finish()
}
