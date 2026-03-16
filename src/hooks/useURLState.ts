import { useEffect } from 'react'
import { useBoardStore } from '@/store/boardStore'

export function useURLState() {
  const importState = useBoardStore((s) => s.importState)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#state=')) {
      const encoded = hash.slice('#state='.length)
      importState(encoded)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
