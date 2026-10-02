import { useEffect, useRef } from 'react'
import { useUI } from '@/store/uiStore'
import Sheet from './Sheet'

export default function ShareFallback() {
  const url = useUI((s) => s.shareFallback)
  const close = () => useUI.getState().setShareFallback(null)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (url) ref.current?.select() }, [url])
  if (!url) return null
  return (
    <Sheet title="Share link" onClose={close} narrow>
      <p className="hint">Copying was blocked here. Select the link and copy it yourself.</p>
      <label className="sr-only" htmlFor="linkout">Board link</label>
      <input id="linkout" ref={ref} data-autofocus className="linkout mono" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
    </Sheet>
  )
}
