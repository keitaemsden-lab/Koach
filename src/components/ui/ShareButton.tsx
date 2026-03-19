import { useState } from 'react'
import { LinkSimple, Check } from '@phosphor-icons/react'
import { useBoardStore } from '@/store/boardStore'

export default function ShareButton() {
  const exportState = useBoardStore((s) => s.exportState)
  const [copied, setCopied] = useState(false)
  const [showLongUrlWarning, setShowLongUrlWarning] = useState(false)

  function handleShare() {
    const encoded = exportState()
    const url = `${window.location.origin}${window.location.pathname}#state=${encoded}`

    if (url.length > 3000) {
      setShowLongUrlWarning(true)
      setTimeout(() => setShowLongUrlWarning(false), 4000)
      return
    }

    navigator.clipboard.writeText(url).then(() => {
      window.location.hash = `state=${encoded}`
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      {showLongUrlWarning && (
        <div
          style={{
            position: 'fixed',
            top: 52,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#f59e0b',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 12,
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          Board is too large to share via URL — save it locally instead
        </div>
      )}
      <button
        title="Copy shareable link"
        aria-label="Copy shareable link"
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
        <Check size={18} weight="light" />
      ) : (
        <LinkSimple size={18} weight="light" />
      )}
    </button>
    </>
  )
}
