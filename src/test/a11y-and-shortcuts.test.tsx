import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import indexHtml from '../../index.html?raw'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Header from '@/components/layout/Header'
import PhoneBar from '@/components/layout/PhoneBar'
import NotesSheet from '@/components/panels/NotesPanel'
import SaveLoadModal from '@/components/panels/SaveLoadModal'
import Confirms from '@/components/panels/Confirms'
import { MoreSheet } from '@/components/panels/SheetsPhone'
import Kits from '@/components/panels/Kits'
import ShareFallback from '@/components/ui/ShareFallback'
import Toast from '@/components/ui/Toast'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useBoardStore } from '@/store/boardStore'
import { useUI } from '@/store/uiStore'
import { shareBoard } from '@/utils/share'

const css = readFileSync(resolve(process.cwd(), 'src/styles/index.css'), 'utf8')

function Shortcuts() { useKeyboardShortcuts(); return null }

beforeEach(() => {
  useBoardStore.setState({ isNotesPanelOpen: false, isSaveLoadModalOpen: false, isMoreOpen: false, mode: 'select' })
  useUI.setState({ confirm: null, shareFallback: null, playPhase: 'idle', toast: null })
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

describe('Saved boards sheet', () => {
  it('is a dialog, starts in the name field with the title, and Escape closes it', () => {
    useBoardStore.setState({ isSaveLoadModalOpen: true, title: 'Press from the front' })
    render(<SaveLoadModal />)
    expect(screen.getByRole('dialog', { name: 'Saves' })).toHaveAttribute('aria-modal', 'true')
    const input = screen.getByLabelText('Save name') as HTMLInputElement
    expect(document.activeElement).toBe(input)
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(useBoardStore.getState().isSaveLoadModalOpen).toBe(false)
  })

  it('saves and lists a board, then opens it', () => {
    useBoardStore.setState({ isSaveLoadModalOpen: true })
    render(<SaveLoadModal />)
    const input = screen.getByLabelText('Save name')
    fireEvent.change(input, { target: { value: 'Corners' } })
    fireEvent.click(screen.getByText('Save'))
    expect(screen.getByText('Corners')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Open'))
    expect(useBoardStore.getState().isSaveLoadModalOpen).toBe(false)
  })

  it('Escape on the reset confirm closes only the confirm', () => {
    useBoardStore.setState({ isSaveLoadModalOpen: true })
    render(<><SaveLoadModal /><Confirms /></>)
    fireEvent.click(screen.getByText('Reset board'))
    const confirm = screen.getByRole('dialog', { name: 'Reset board' })
    fireEvent.keyDown(confirm, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Reset board' })).toBeNull()
    expect(useBoardStore.getState().isSaveLoadModalOpen).toBe(true)
  })

  it('reset can be undone', () => {
    useBoardStore.setState({ title: 'Keep me', notes: 'n' })
    useUI.setState({ confirm: 'reset-board' })
    render(<Confirms />)
    fireEvent.click(screen.getAllByText('Reset board').find((b) => b.tagName === 'BUTTON')!)
    expect(useBoardStore.getState().title).toBe('Untitled board')
    act(() => useBoardStore.temporal.getState().undo())
    expect(useBoardStore.getState().title).toBe('Keep me')
  })
})

describe('keyboard shortcuts', () => {
  it('n toggles the notes sheet on a phone', () => {
    render(<Shortcuts />)
    fireEvent.keyDown(document.body, { key: 'n' })
    expect(useBoardStore.getState().isNotesPanelOpen).toBe(true)
    fireEvent.keyDown(document.body, { key: 'n' })
    expect(useBoardStore.getState().isNotesPanelOpen).toBe(false)
  })

  it('shortcuts do not fire while typing or inside a dialog', () => {
    render(<><Shortcuts /><input aria-label="x" /><div role="dialog"><button>b</button></div></>)
    fireEvent.keyDown(screen.getByLabelText('x'), { key: 'n' })
    fireEvent.keyDown(screen.getByText('b'), { key: 'd' })
    expect(useBoardStore.getState().isNotesPanelOpen).toBe(false)
    expect(useBoardStore.getState().mode).toBe('select')
  })

  it('d draws, s and v go back to move', () => {
    render(<Shortcuts />)
    fireEvent.keyDown(document.body, { key: 'd' })
    expect(useBoardStore.getState().mode).toBe('draw-arrow')
    fireEvent.keyDown(document.body, { key: 's' })
    expect(useBoardStore.getState().mode).toBe('select')
    fireEvent.keyDown(document.body, { key: 'd' })
    fireEvent.keyDown(document.body, { key: 'v' })
    expect(useBoardStore.getState().mode).toBe('select')
  })

  it('p with no arrows says what to do instead of failing silently', () => {
    useBoardStore.setState({ arrows: [] })
    render(<><Shortcuts /><Toast /></>)
    fireEvent.keyDown(document.body, { key: 'p' })
    expect(useUI.getState().toast?.msg).toMatch(/Draw a run first/)
  })
})

describe('notes sheet', () => {
  it('is not in the DOM while closed, so its textarea cannot take focus', () => {
    render(<NotesSheet />)
    expect(document.querySelector('textarea')).toBeNull()
    act(() => useBoardStore.setState({ isNotesPanelOpen: true }))
    expect(screen.getByRole('dialog', { name: 'Coaching notes' })).toBeInTheDocument()
    expect(document.activeElement?.tagName).toBe('TEXTAREA')
  })
})

describe('page semantics and type', () => {
  it('has exactly one h1, and it is the editable board title', () => {
    useBoardStore.setState({ title: 'Build-up v 4-4-2' })
    render(<Header />)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe('Build-up v 4-4-2')
    expect(h1s[0].getAttribute('contenteditable')).toBe('plaintext-only')
  })

  it('index.html: koach og:url, en-AU, no external stylesheet or font CDN, Switzer preloaded', () => {
    expect(indexHtml).toContain('<meta property="og:url" content="https://koach.keitaemsden.com"')
    expect(indexHtml).toContain('lang="en-AU"')
    expect(indexHtml).not.toContain('fonts.googleapis.com')
    expect(indexHtml).toContain('/fonts/switzer-500.woff2')
  })

  it('uses self-hosted Switzer and DM Mono, never Inter', () => {
    expect(css).toMatch(/font-family: "Switzer"; src: url\("\/fonts\/switzer-400\.woff2"\)/)
    expect(css).toMatch(/font-family: "DM Mono"/)
    expect(css).not.toMatch(/Inter/)
    expect(css).not.toMatch(/https?:\/\//)
  })
})

describe('phone toolbar', () => {
  it('has six tools and none of them scroll off screen', () => {
    render(<PhoneBar />)
    const bar = screen.getByRole('navigation', { name: 'Board tools' })
    const buttons = bar.querySelectorAll('button')
    expect(buttons).toHaveLength(6)
    for (const name of ['Move', 'Draw', 'Play the move', 'Shape', 'Undo', 'More']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    // the 60 px rule lives in the stylesheet
    expect(css).toMatch(/\.tb \{[^}]*min-height: 60px/)
  })

  it('More holds everything that left the bar', () => {
    useBoardStore.setState({ isMoreOpen: true })
    render(<MoreSheet />)
    for (const name of ['Redo', 'Share link', 'Export PNG', 'Save or open a board', 'Clear arrows', 'Reset board', 'Rotate pitch']) {
      expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: /Coaching notes/ })).toBeInTheDocument()
  })
})

describe('kits', () => {
  it('labels both kits in words, not single letters', () => {
    render(<Kits />)
    expect(screen.getByLabelText('Home kit colour')).toBeInTheDocument()
    expect(screen.getByLabelText('Opposition kit colour')).toBeInTheDocument()
    expect(screen.getByText('Home kit')).toBeInTheDocument()
  })
})

describe('share link', () => {
  it('copies the link when the clipboard works', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    await shareBoard()
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('#state=v1:'))
    expect(useUI.getState().toast?.msg).toMatch(/Link copied/)
  })

  it('shows the link to copy by hand when the clipboard is blocked', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<ShareFallback />)
    await act(async () => { await shareBoard() })
    const input = screen.getByLabelText('Board link') as HTMLInputElement
    expect(input.value).toContain('#state=v1:')
    expect(screen.getByRole('dialog', { name: 'Share link' })).toBeInTheDocument()
  })
})
