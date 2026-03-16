import { useRef, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Toolbar from '@/components/layout/Toolbar'
import BoardCanvas from '@/components/board/BoardCanvas'
import NotesPanel from '@/components/panels/NotesPanel'
import SaveLoadModal from '@/components/panels/SaveLoadModal'
import { useBoardStore } from '@/store/boardStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useURLState } from '@/hooks/useURLState'

const SESSION_KEY = 'tactic-board:last-session'

function useAutoSave() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const unsub = useBoardStore.subscribe((state) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const data = {
          players: state.players,
          arrows: state.arrows,
          notes: state.notes,
          homeColour: state.homeColour,
          awayColour: state.awayColour,
        }
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(data)) } catch { /* ignore */ }
      }, 500)
    })
    return () => { unsub(); clearTimeout(timer) }
  }, [])
}

export default function App() {
  const boardRef = useRef<HTMLDivElement>(null)
  const loadLastSession = useBoardStore((s) => s.loadLastSession)

  useKeyboardShortcuts()
  useURLState()
  useAutoSave()

  // Restore last session on mount (unless URL state was loaded)
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#state=')) {
      loadLastSession()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', overflow: 'hidden' }}
    >
      <Header />

      {/* Desktop toolbar */}
      <div className="hidden md:block flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <Toolbar boardRef={boardRef} />
      </div>

      {/* Main content */}
      <main className="flex flex-1 overflow-hidden">
        <BoardCanvas boardRef={boardRef} />
        <NotesPanel />
      </main>

      {/* Mobile bottom toolbar */}
      <div
        className="md:hidden flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Toolbar boardRef={boardRef} />
      </div>

      <SaveLoadModal />
    </div>
  )
}
