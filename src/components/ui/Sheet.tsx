import type { ReactNode } from 'react'
import Dialog from './Dialog'

interface SheetProps {
  title: string
  onClose: () => void
  children: ReactNode
  closeLabel?: string
  narrow?: boolean
  /** Shown as the heading; defaults to the title. */
  heading?: ReactNode
}

/** A square sheet: bottom sheet on phones, centred panel on desktop. Dialog semantics come from Dialog. */
export default function Sheet({ title, onClose, children, closeLabel = 'Close', narrow, heading }: SheetProps) {
  return (
    <Dialog
      label={title}
      onClose={onClose}
      closeOnBackdrop
      overlayClassName="backdrop"
      panelClassName={'sheet' + (narrow ? ' narrow' : '')}
    >
      <div className="sheet-h">
        <h2>{heading ?? title}</h2>
        <button className="btn quiet" onClick={onClose}>{closeLabel}</button>
      </div>
      {children}
    </Dialog>
  )
}
