import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import indexHtml from '../../index.html?raw'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Header from '@/components/layout/Header'
import NotesPanel from '@/components/panels/NotesPanel'
import SaveLoadModal from '@/components/panels/SaveLoadModal'
import Toolbar from '@/components/layout/Toolbar'
import HelpOverlay from '@/components/ui/HelpOverlay'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useBoardStore } from '@/store/boardStore'

function Shortcuts() { useKeyboardShortcuts(); return null }

beforeEach(() => {
  useBoardStore.setState({ isNotesPanelOpen: false, isSaveLoadModalOpen: false, mode: 'select' })
})

describe('Dialog', () => {
  function Harness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button onClick={() => setOpen(true)}>opener</button>
        {open && (
          <Dialog label="Test dialog" onClose={() => setOpen(false)}>
            <button>first</button>
            <button>last</button>
          </Dialog>
        )}
      </>
    )
  }

  it('has dialog semantics, closes on Escape and returns focus', () => {
    render(<Harness />)
    const opener = screen.getByText('opener')
    opener.focus()
    fireEvent.click(opener)
    const dlg = screen.getByRole('dialog', { name: 'Test dialog' })
    expect(dlg).toHaveAttribute('aria-modal', 'true')
    expect(document.activeElement).toBe(screen.getByText('first'))
    fireEvent.keyDown(screen.getByText('first'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('traps Tab inside the dialog', () => {
    render(<Harness />)
    fireEvent.click(screen.getByText('opener'))
    const last = screen.getByText('last')
    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(screen.getByText('first'))
    fireEvent.keyDown(screen.getByText('first'), { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })
})

describe('Save / Load modal', () => {
  it('is a dialog and Escape closes it, even from the name input', () => {
    useBoardStore.setState({ isSaveLoadModalOpen: true })
    render(<SaveLoadModal />)
    expect(screen.getByRole('dialog', { name: 'Saves' })).toHaveAttribute('aria-modal', 'true')
    const input = screen.getByLabelText('Save name')
    expect(document.activeElement).toBe(input)
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(useBoardStore.getState().isSaveLoadModalOpen).toBe(false)
  })

  it('Escape on the confirm dialog closes only the confirm', () => {
    useBoardStore.setState({ isSaveLoadModalOpen: true })
    render(<SaveLoadModal />)
    fireEvent.click(screen.getByText('Reset board'))
    const confirm = screen.getByRole('dialog', { name: 'Reset board' })
    fireEvent.keyDown(confirm, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Reset board' })).toBeNull()
    expect(useBoardStore.getState().isSaveLoadModalOpen).toBe(true)
  })
})

describe('keyboard shortcuts', () => {
  it('n toggles the notes panel', () => {
    render(<Shortcuts />)
    fireEvent.keyDown(document.body, { key: 'n' })
    expect(useBoardStore.getState().isNotesPanelOpen).toBe(true)
    fireEvent.keyDown(document.body, { key: 'n' })
    expect(useBoardStore.getState().isNotesPanelOpen).toBe(false)
  })

  it('n does not fire while typing or inside a dialog', () => {
    render(<><Shortcuts /><input aria-label="x" /><div role="dialog"><button>b</button></div></>)
    fireEvent.keyDown(screen.getByLabelText('x'), { key: 'n' })
    fireEvent.keyDown(screen.getByText('b'), { key: 'd' })
    expect(useBoardStore.getState().isNotesPanelOpen).toBe(false)
    expect(useBoardStore.getState().mode).toBe('select')
  })

  it('d and s switch modes', () => {
    render(<Shortcuts />)
    fireEvent.keyDown(document.body, { key: 'd' })
    expect(useBoardStore.getState().mode).toBe('draw-arrow')
    fireEvent.keyDown(document.body, { key: 's' })
    expect(useBoardStore.getState().mode).toBe('select')
  })
})

describe('notes panel', () => {
  it('hidden panels are inert so their textareas cannot take focus', () => {
    const { container } = render(<NotesPanel />)
    const sheet = container.querySelector('.md\\:hidden') as HTMLElement
    expect(sheet.hasAttribute('inert')).toBe(true)
    act(() => useBoardStore.setState({ isNotesPanelOpen: true }))
    expect(sheet.hasAttribute('inert')).toBe(false)
  })
})

describe('page semantics', () => {
  it('has exactly one h1', () => {
    render(<Header />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('index.html points og:url at koach and loads no external stylesheet', () => {
    const html = indexHtml
    expect(html).toContain('<meta property="og:url" content="https://koach.keitaemsden.com"')
    expect(html).not.toContain('tactics.keitaemsden.com')
    expect(html).not.toContain('fonts.googleapis.com')
  })
})

describe('help card', () => {
  it('does not sit at the bottom (toolbar zone) and can be dismissed', () => {
    render(<HelpOverlay />)
    const card = screen.getByRole('status')
    expect(card.style.bottom).toBe('')
    expect(card.style.top).not.toBe('')
    fireEvent.click(screen.getByText(/Got it/))
    expect(screen.queryByRole('status')).toBeNull()
    expect(localStorage.getItem('tactic-board:seen-help')).toBe('1')
  })
})

describe('toolbar', () => {
  it('wraps instead of hiding controls behind a horizontal scroll', () => {
    const ref = { current: null }
    const { container } = render(<Toolbar boardRef={ref} />)
    const pill = container.querySelector('.toolbar-pill') as HTMLElement
    expect(pill.style.overflowX).not.toBe('auto')
    expect(pill.className).toContain('flex-wrap')
    for (const name of ['Undo', 'Redo', 'Toggle notes panel', 'Save / Load', 'Export as PNG']) {
      expect(screen.getByLabelText(name)).toBeInTheDocument()
    }
  })
})
