import { useEffect, useState } from 'react'
import { useUI } from '@/store/uiStore'

export default function Toast() {
  const toast = useUI((s) => s.toast)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!toast) return
    const a = setTimeout(() => setOn(true), 0)
    const b = setTimeout(() => setOn(false), 2600)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [toast])
  return <div className={'toast' + (on ? ' on' : '')} role="status" aria-live="polite">{toast?.msg ?? ''}</div>
}
