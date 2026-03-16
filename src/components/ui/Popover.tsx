import type { ReactNode, CSSProperties } from 'react'

interface PopoverProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export default function Popover({ children, style, className }: PopoverProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-toolbar)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
