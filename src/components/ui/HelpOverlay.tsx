import { useState, useEffect } from 'react'

export default function HelpOverlay() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('tactic-board:seen-help'))

  const dismiss = () => {
    localStorage.setItem('tactic-board:seen-help', '1')
    setVisible(false)
  }

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(dismiss, 5000)
    return () => clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 20,
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 12,
        padding: '12px 16px',
        color: 'white',
        fontSize: 12,
        maxWidth: 180,
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
        }}
      >
        Got it ×
      </button>
    </div>
  )
}
