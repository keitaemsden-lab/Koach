import { useState, type RefObject } from 'react'
import { exportToPNG } from '@/utils/export'

interface ExportButtonProps {
  boardRef: RefObject<HTMLDivElement | null>
}

export default function ExportButton({ boardRef }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      await exportToPNG(boardRef)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      title="Export as PNG"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center justify-center rounded-lg transition-colors duration-150 px-2"
      style={{
        height: 36, minWidth: 44,
        background: 'transparent',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        cursor: loading ? 'wait' : 'pointer',
      }}
    >
      {loading ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
    </button>
  )
}
