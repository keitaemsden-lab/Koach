import { useEffect } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { toast } from '@/store/uiStore'

export function useURLState() {
  const importState = useBoardStore((s) => s.importState)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#state=')) {
      const encoded = hash.slice('#state='.length)
      void importState(encoded).then(() => {
        useBoardStore.temporal.getState().clear()
        toast('Opened a shared board')
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
