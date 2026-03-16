import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function Button({ variant = 'ghost', className, style, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    minWidth: 44, minHeight: 36,
    fontFamily: 'DM Mono, monospace',
    fontSize: 12,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'background 150ms ease',
  }

  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8 },
    secondary: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8 },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: 8 },
  }

  return (
    <button
      className={cn('flex items-center justify-center px-3', className)}
      style={{ ...base, ...variants[variant], ...style }}
      {...props}
    />
  )
}
