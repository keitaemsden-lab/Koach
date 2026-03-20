import type { ReactNode } from 'react'

interface ToolbarButtonProps {
  icon: ReactNode
  title: string
  ariaLabel: string
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  className?: string
}

export default function ToolbarButton({
  icon,
  title,
  ariaLabel,
  onClick,
  isActive = false,
  disabled = false,
  className = '',
}: ToolbarButtonProps) {
  return (
    <button
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-lg transition-colors duration-150 ${className}`}
      style={{
        width: 36,
        height: 36,
        minWidth: 44,
        background: isActive ? 'var(--accent)' : 'transparent',
        color: disabled ? 'var(--border)' : isActive ? 'white' : 'rgba(255,255,255,0.55)',
        borderRadius: 8,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {icon}
    </button>
  )
}
