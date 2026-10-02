import { useEffect, useRef, type ReactNode, type CSSProperties, type KeyboardEvent } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface DialogProps {
  /** Accessible name for the dialog. */
  label: string
  onClose: () => void
  children: ReactNode
  /** Close when the backdrop is clicked. */
  closeOnBackdrop?: boolean
  overlayClassName?: string
  overlayStyle?: CSSProperties
  panelClassName?: string
  panelStyle?: CSSProperties
}

/**
 * Modal dialog shell: role=dialog, aria-modal, Escape to close, Tab focus trap,
 * focus moves in on open (to [data-autofocus] or the first control) and returns
 * to the previously focused element on close. Mount it only while open.
 */
export default function Dialog({
  label, onClose, children, closeOnBackdrop = false,
  overlayClassName = '', overlayStyle, panelClassName = '', panelStyle,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    if (panel) {
      const target =
        panel.querySelector<HTMLElement>('[data-autofocus]') ??
        panel.querySelector<HTMLElement>(FOCUSABLE) ??
        panel
      target.focus()
    }
    return () => {
      if (previous && previous.isConnected) previous.focus()
    }
  }, [])

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // Dialogs can nest (React events bubble through portals): only the innermost reacts.
    if (e.key === 'Escape') {
      e.stopPropagation()
      e.preventDefault()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) { e.preventDefault(); panel.focus(); return }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault(); first.focus()
    } else if (!panel.contains(active)) {
      e.preventDefault(); first.focus()
    }
  }

  return (
    <div
      className={overlayClassName}
      style={overlayStyle}
      onClick={closeOnBackdrop ? onClose : undefined}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={panelClassName}
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
