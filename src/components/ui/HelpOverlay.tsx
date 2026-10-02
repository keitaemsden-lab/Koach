import { useState, useEffect, useCallback } from 'react'

export default function HelpOverlay() {
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem('tactic-board:seen-help') } catch { return true }
  })

  const dismiss = useCallback(() => {
    try { localStorage.setItem('tactic-board:seen-help', '1') } catch { /* ignore */ }
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(dismiss, 5000)
    return () => clearTimeout(timer)
  }, [visible, dismiss])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-label="Quick tips"
      style={{
        // Top of the board, away from the toolbar: never covers a control
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 20,
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 12,
        padding: '12px 16px',
        color: 'white',
        fontSize: 12,
        maxWidth: 'min(180px, calc(100% - 16px))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        lineHeight: 1.5,
      }}
    >
      <p style={{ margin: '0 0 4px' }}>Drag players to position them</p>
      <p style={{ margin: '0 0 4px' }}>Switch to Draw mode to add arrows</p>
      <p style={{ margin: '0 0 8px' }}>Tap a player to edit name</p>
      <button
        onClick={dismiss}
        style={{
          fontSize: 11,
          opacity: 0.7,
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: 0,
          minHeight: 44,
          minWidth: 44,
          textAlign: 'left',
        }}
      >
        Got it ×
      </button>
    </div>
  )
}
