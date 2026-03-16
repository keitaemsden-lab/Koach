import type { SerializableState } from '@/store/types'

export function encodeState(state: SerializableState): string {
  return btoa(encodeURIComponent(JSON.stringify(state)))
}

export function decodeState(encoded: string): SerializableState {
  return JSON.parse(decodeURIComponent(atob(encoded))) as SerializableState
}
