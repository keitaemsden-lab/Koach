import pako from 'pako'
import type { SerializableState } from '@/store/types'

// v1: pako-deflated + base64. Prefix distinguishes from legacy uncompressed hashes.
const PREFIX = 'v1:'

export function encodeState(state: SerializableState): string {
  const json = JSON.stringify(state)
  const compressed = pako.deflate(json)
  const binary = String.fromCharCode(...compressed)
  return PREFIX + btoa(binary)
}

export function decodeState(encoded: string): SerializableState {
  // Legacy uncompressed format (no prefix)
  if (!encoded.startsWith(PREFIX)) {
    return JSON.parse(decodeURIComponent(atob(encoded))) as SerializableState
  }
  const binary = atob(encoded.slice(PREFIX.length))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  const json = pako.inflate(bytes, { to: 'string' })
  return JSON.parse(json) as SerializableState
}
