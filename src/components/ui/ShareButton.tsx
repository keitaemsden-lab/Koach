import { useState } from 'react'
import { useBoardStore } from '@/store/boardStore'

export default function ShareButton() {
  const exportState = useBoardStore((s) => s.exportState)
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const encoded = exportState()
    const url = `${window.location.origin}${window.location.pathname}#state=${encoded}`

    if (url.length > 3000) {
      alert('Board state is very large. Consider saving locally instead.')
    }

    navigator.clipboard.writeText(url).then(() => {
      window.location.hash = `state=${encoded}`
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      title="Copy shareable link"
      onClick={handleShare}
      className="flex items-center justify-center gap-1 rounded-lg transition-colors duration-150 px-2"
      style={{
        height: 36, minWidth: 44,
        background: copied ? 'var(--accent)' : 'transparent',
        color: copied ? 'white' : 'var(--text-secondary)',
        border: '1px solid var(--border)',
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
      }}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  )
}
