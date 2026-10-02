import { useSyncExternalStore } from 'react'

const subs = new Map<string, (cb: () => void) => () => void>()

function subscribe(query: string) {
  const hit = subs.get(query)
  if (hit) return hit
  const fn = (cb: () => void) => {
    const m = window.matchMedia(query)
    m.addEventListener?.('change', cb)
    return () => m.removeEventListener?.('change', cb)
  }
  subs.set(query, fn)
  return fn
}

export function useMedia(query: string) {
  return useSyncExternalStore(subscribe(query), () => window.matchMedia(query).matches, () => false)
}

export const DESK_QUERY = '(min-width: 900px)'
export const useIsDesk = () => useMedia(DESK_QUERY)
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
