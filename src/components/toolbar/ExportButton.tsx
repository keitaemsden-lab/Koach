import { useState, type RefObject } from 'react'
import { DownloadSimple } from '@phosphor-icons/react'
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
      aria-label="Export as PNG"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center justify-center rounded-lg transition-colors duration-150"
      style={{
        width: 36, height: 36, minWidth: 44,
        background: 'transparent',
        color: 'rgba(255,255,255,0.55)',
        border: 'none',
        borderRadius: 8,
        cursor: loading ? 'wait' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'color 150ms ease',
      }}
    >
      {loading ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      ) : (
        <DownloadSimple size={18} weight="light" />
      )}
    </button>
  )
}
