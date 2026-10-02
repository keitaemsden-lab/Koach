import { describe, it, expect, beforeEach } from 'vitest'
import { encodeState, decodeState } from '@/utils/encode'
import { useBoardStore } from '@/store/boardStore'

describe('encode', () => {
  it('round-trips board state', () => {
    const s = useBoardStore.getState()
    const state = { players: s.players, arrows: [], notes: 'hi', homeColour: '#111111', awayColour: '#222222' }
    const back = decodeState(encodeState(state as never))
    expect(back).toEqual(state)
  })

  it('still decodes the legacy uncompressed format', () => {
    const legacy = btoa(encodeURIComponent(JSON.stringify({ notes: 'old' })))
    expect(decodeState(legacy)).toEqual({ notes: 'old' })
  })
})

describe('board store', () => {
  beforeEach(() => useBoardStore.getState().clearBoard())

  it('starts with 22 players', () => {
    expect(useBoardStore.getState().players).toHaveLength(22)
  })

  it('moves and removes a player', () => {
    const id = useBoardStore.getState().players[0].id
    useBoardStore.getState().movePlayer(id, 100, 200)
    expect(useBoardStore.getState().players.find((p) => p.id === id)).toMatchObject({ x: 100, y: 200 })
    useBoardStore.getState().removePlayer(id)
    expect(useBoardStore.getState().players.find((p) => p.id === id)).toBeUndefined()
  })

  it('toggles notes panel', () => {
    const before = useBoardStore.getState().isNotesPanelOpen
    useBoardStore.getState().toggleNotesPanel()
    expect(useBoardStore.getState().isNotesPanelOpen).toBe(!before)
  })
})
