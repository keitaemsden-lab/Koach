import { describe, it, expect, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import { demoBoard } from '@/store/demo'
import { loadInitialBoard } from '@/store/boot'
import {
  toView, toPortrait, deltaToPortrait, prefersLandscape, normaliseState, looksLandscape,
  controlFromStroke, arrowPathD, along, playerAt, inkOn, arrowInk,
} from '@/utils/geometry'
import { planMove, endFrame, moveDuration, togglePlay, PRESS_REACH } from '@/play/playMove'
import { boardDom } from '@/play/boardDom'
import { exportFileName } from '@/utils/export'
import BoardCanvas from '@/components/board/BoardCanvas'
import type { Arrow, SerializableState } from '@/store/types'

beforeEach(() => {
  useUI.setState({ playPhase: 'idle', toast: null })
  useBoardStore.setState({ ...demoBoard(), mode: 'select', selectedPlayerId: null, selectedArrowId: null })
  useBoardStore.temporal.getState().clear()
})

describe('geometry', () => {
  it('landscape view puts home on the left attacking right, and round-trips', () => {
    const homeGoal = { x: 340, y: 1040 }
    expect(toView(homeGoal, true).x).toBeLessThan(50)
    for (const p of [{ x: 12, y: 900 }, { x: 600, y: 40 }]) {
      expect(toPortrait(toView(p, true), true)).toEqual(p)
      expect(toPortrait(toView(p, false), false)).toEqual(p)
    }
    expect(deltaToPortrait({ x: 10, y: 0 }, true)).toEqual({ x: 0, y: -10 })
  })

  it('lies the pitch landscape only in wide boxes', () => {
    expect(prefersLandscape(1050, 700)).toBe(true)
    expect(prefersLandscape(359, 620)).toBe(false)
  })

  it('rotates boards saved in the old landscape coordinates back to portrait', () => {
    const legacy = {
      players: [{ id: 'a', team: 'home', position: 'GK', name: '#1', x: 960, y: 340 }],
      arrows: [{ id: 'r', type: 'run', style: 'curved', start: { x: 960, y: 340 }, end: { x: 800, y: 200 }, teamColour: '#2563eb' }],
      notes: '', homeColour: '#2563eb', awayColour: '#dc2626',
    } as unknown as SerializableState
    expect(looksLandscape(legacy)).toBe(true)
    const s = normaliseState(legacy)
    expect(s.players[0]).toMatchObject({ x: 340, y: 960 })
    expect(s.arrows[0].end).toEqual({ x: 480, y: 800 })
    expect(s.orientation).toBe('portrait')
    // already canonical: untouched
    expect(normaliseState(s).players[0]).toMatchObject({ x: 340, y: 960 })
  })

  it('fits a curve to a bent stroke and keeps a straight stroke straight', () => {
    const bent = [{ x: 0, y: 0 }, { x: 50, y: 40 }, { x: 100, y: 0 }]
    expect(controlFromStroke(bent)).toEqual({ x: 50, y: 80 })
    expect(controlFromStroke([{ x: 0, y: 0 }, { x: 50, y: 1 }, { x: 100, y: 0 }])).toBeUndefined()
  })

  it('draws press as a zigzag that still ends on the target', () => {
    const a = { id: 'p', type: 'press', style: 'curved', start: { x: 0, y: 0 }, end: { x: 0, y: 200 }, teamColour: '' } as Arrow
    const d = arrowPathD(a)
    expect(d.split('L').length).toBeGreaterThan(10)
    expect(d.endsWith('L0 200')).toBe(true)
    expect(along(a, 0.5)).toEqual({ x: 0, y: 100 })
  })

  it('finds the player under a point and picks readable token ink', () => {
    const players = useBoardStore.getState().players
    expect(playerAt(players, { x: players[0].x + 5, y: players[0].y }, 20)?.id).toBe(players[0].id)
    expect(playerAt(players, { x: -500, y: -500 }, 20)).toBeNull()
    expect(inkOn('#E8442E')).toBe('#0A0F0C')
    expect(inkOn('#12301F')).toBe('#EEF2EA')
  })

  it('works out the ink of old arrows from their colour', () => {
    const a = { teamColour: '#2563EB' } as Arrow
    expect(arrowInk(a, '#2563eb', '#dc2626')).toBe('home')
    expect(arrowInk({ ...a, teamColour: '#ffffff' }, '#2563eb', '#dc2626')).toBe('neutral')
    expect(arrowInk({ ...a, team: 'away' }, '#2563eb', '#dc2626')).toBe('away')
  })
})

describe('board store', () => {
  it('arrows that start on a player follow them', () => {
    const { arrows, players } = useBoardStore.getState()
    const liam = players.find((p) => p.name === 'Liam')!
    useBoardStore.getState().movePlayer(liam.id, 200, 700)
    const run = useBoardStore.getState().arrows.find((a) => a.id === arrows[0].id)!
    expect(run.start).toEqual({ x: 200, y: 700 })
  })

  it('changes one side shape and leaves the other alone', () => {
    const before = useBoardStore.getState().players.filter((p) => p.team === 'away').map((p) => [p.x, p.y])
    useBoardStore.getState().loadFormation('3-5-2', false, 'home')
    const s = useBoardStore.getState()
    expect(s.activeFormation).toBe('3-5-2')
    expect(s.awayFormation).toBe('4-4-2')
    expect(s.players.filter((p) => p.team === 'away').map((p) => [p.x, p.y])).toEqual(before)
    expect(s.players.find((p) => p.name === 'Kenji')).toBeTruthy()
  })

  it('own half keeps the shape behind halfway', () => {
    useBoardStore.getState().loadFormation('4-3-3', true, 'both')
    const s = useBoardStore.getState()
    expect(s.players.filter((p) => p.team === 'home').every((p) => p.y >= 525)).toBe(true)
    expect(s.players.filter((p) => p.team === 'away').every((p) => p.y <= 525)).toBe(true)
  })

  it('selection and UI toggles never become undo steps', () => {
    const s = useBoardStore.getState()
    s.selectPlayer(s.players[0].id)
    s.setMoreOpen(true)
    s.setMode('draw-arrow')
    expect(useBoardStore.temporal.getState().pastStates).toHaveLength(0)
    s.setTitle('New title')
    expect(useBoardStore.temporal.getState().pastStates).toHaveLength(1)
  })

  it('share links round-trip, title and both shapes included', async () => {
    useBoardStore.getState().setTitle('Corners')
    const code = await useBoardStore.getState().exportState()
    useBoardStore.getState().clearBoard()
    await useBoardStore.getState().importState(code)
    const s = useBoardStore.getState()
    expect(s.title).toBe('Corners')
    expect(s.awayFormation).toBe('4-4-2')
    expect(s.arrows).toHaveLength(4)
  })

  it('first visit opens the worked example; later visits open the last session', () => {
    useBoardStore.getState().clearBoard()
    loadInitialBoard()
    expect(useBoardStore.getState().arrows.length).toBe(4)
    localStorage.setItem('tactic-board:last-session', JSON.stringify({ players: [], arrows: [], notes: 'mine', homeColour: '#000000', awayColour: '#ffffff' }))
    loadInitialBoard()
    expect(useBoardStore.getState().notes).toBe('mine')
    expect(useBoardStore.temporal.getState().pastStates).toHaveLength(0)
  })
})

describe('play the move', () => {
  it('plans steps in arrow order: runners run, passes move the ball', () => {
    const { arrows, players } = useBoardStore.getState()
    const steps = planMove(arrows, players)
    expect(steps.map((s) => s.index)).toEqual([0, 1, 2, 3])
    expect(steps[0].runnerId).toBe(players.find((p) => p.name === 'Liam')!.id)
    expect(steps[1].runnerId).toBeNull()
    expect(steps[2].reach).toBe(PRESS_REACH)
    expect(steps[1].delay).toBeGreaterThan(steps[0].delay)
    const { positions, balls } = endFrame(steps)
    expect(positions.size).toBe(3)
    expect(balls).toEqual([arrows[1].end])
    expect(moveDuration(steps)).toBeGreaterThan(2000)
  })

  it('finds the runner of an old arrow by where it starts', () => {
    const { players } = useBoardStore.getState()
    const a = { id: 'x', type: 'run', style: 'curved', start: { x: players[3].x + 4, y: players[3].y }, end: { x: 100, y: 100 }, teamColour: '' } as Arrow
    expect(planMove([a], players)[0].runnerId).toBe(players[3].id)
  })

  it('with reduced motion holds a still end frame until Back, and never touches undo', () => {
    const mm = window.matchMedia
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: q.includes('reduce') })) as typeof window.matchMedia
    try {
      const { container } = render(<BoardCanvas />)
      expect(boardDom.svg).not.toBeNull()
      const liam = useBoardStore.getState().players.find((p) => p.name === 'Liam')!
      const node = container.querySelector(`[data-player-id="${liam.id}"]`) as SVGGElement
      const before = node.style.transform
      act(() => togglePlay())
      expect(useUI.getState().playPhase).toBe('held')
      expect(node.style.transform).not.toBe(before)
      expect(container.querySelectorAll('.ball')).toHaveLength(1)
      act(() => togglePlay())
      expect(useUI.getState().playPhase).toBe('idle')
      expect(node.style.transform).toBe(before)
      expect(container.querySelectorAll('.ball')).toHaveLength(0)
      expect(useBoardStore.temporal.getState().pastStates).toHaveLength(0)
    } finally {
      window.matchMedia = mm
    }
  })

  it('every player token offers at least a 44 px touch target', () => {
    const { container } = render(<BoardCanvas />)
    const hits = [...container.querySelectorAll('.pl .hit')].map((c) => Number(c.getAttribute('r')) * boardDom.scale * 2)
    expect(hits).toHaveLength(22)
    expect(Math.min(...hits)).toBeGreaterThanOrEqual(44)
  })
})

describe('export', () => {
  it('names the PNG after the board', () => {
    expect(exportFileName('U14 Div 1: build-up!')).toBe('koach-u14-div-1-build-up.png')
    expect(exportFileName('***')).toBe('koach-board.png')
  })
})
