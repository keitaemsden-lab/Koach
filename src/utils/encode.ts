import type { SerializableState } from '@/store/types'

// v1: zlib deflate + base64 (byte-compatible with the pako links shared before the redesign).
// Uses the browser's own CompressionStream, so no compression library ships in the bundle.
const PREFIX = 'v1:'

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const writer = stream.writable.getWriter()
  void writer.write(bytes as unknown as BufferSource).then(() => writer.close())
  const reader = stream.readable.getReader()
  const parts: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    parts.push(value); size += value.length
  }
  const out = new Uint8Array(size)
  let o = 0
  for (const p of parts) { out.set(p, o); o += p.length }
  return out
}

function toB64(bytes: Uint8Array) {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(bin)
}

export async function encodeState(state: SerializableState): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(state))
  if (typeof CompressionStream === 'undefined') return btoa(encodeURIComponent(JSON.stringify(state)))
  return PREFIX + toB64(await pipe(json, new CompressionStream('deflate')))
}

export async function decodeState(encoded: string): Promise<SerializableState> {
  // Legacy uncompressed format (no prefix)
  if (!encoded.startsWith(PREFIX)) {
    return JSON.parse(decodeURIComponent(atob(encoded))) as SerializableState
  }
  const bytes = Uint8Array.from(atob(encoded.slice(PREFIX.length)), (c) => c.charCodeAt(0))
  const json = new TextDecoder().decode(await pipe(bytes, new DecompressionStream('deflate')))
  return JSON.parse(json) as SerializableState
}
