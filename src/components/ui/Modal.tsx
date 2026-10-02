import type { ReactNode } from 'react'
import Dialog from './Dialog'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  if (!open) return null

  return (
    <Dialog
      label={title ?? 'Dialog'}
      onClose={onClose}
      closeOnBackdrop
      overlayClassName="fixed inset-0 flex items-center justify-center z-50"
      overlayStyle={{ background: 'rgba(0,0,0,0.6)' }}
      panelClassName="rounded-xl shadow-2xl w-full max-w-md mx-4"
      panelStyle={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        fontFamily: 'DM Mono, monospace',
      }}
    >
      {title && (
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-medium text-sm">{title}</span>
          <button onClick={onClose} aria-label="Close" style={{ color: 'var(--text-secondary)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
      )}
      {children}
    </Dialog>
  )
}
