import { describe, it, expect, beforeEach } from 'vitest'
import { encodeState, decodeState } from '@/utils/encode'
import { useBoardStore } from '@/store/boardStore'

describe('encode', () => {
  it('round-trips board state', async () => {
    const s = useBoardStore.getState()
    const state = { players: s.players, arrows: [], notes: 'hi', homeColour: '#111111', awayColour: '#222222' }
    const back = await decodeState(await encodeState(state as never))
    expect(back).toEqual(state)
  })

  it('still decodes the legacy uncompressed format', async () => {
    const legacy = btoa(encodeURIComponent(JSON.stringify({ notes: 'old' })))
    expect(await decodeState(legacy)).toEqual({ notes: 'old' })
  })

  it('decodes a v1 link made by the old pako build', async () => {
    // pako.deflate('{"notes":"pako"}') in base64, captured from the pre-redesign encoder
    const old = 'v1:eJyrVsrLL0ktVrJSKkjMzleqBQAv2QWP'
    expect(await decodeState(old)).toEqual({ notes: 'pako' })
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
