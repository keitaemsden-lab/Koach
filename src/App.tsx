import { useEffect } from 'react'
import Header from '@/components/layout/Header'
import ToolStrip from '@/components/layout/ToolStrip'
import PhoneBar from '@/components/layout/PhoneBar'
import Dock from '@/components/layout/Dock'
import BoardCanvas from '@/components/board/BoardCanvas'
import MatchSheet from '@/components/panels/MatchSheet'
import NotesSheet from '@/components/panels/NotesPanel'
import SaveLoadModal from '@/components/panels/SaveLoadModal'
import Confirms from '@/components/panels/Confirms'
import { ShapeSheet, MoreSheet } from '@/components/panels/SheetsPhone'
import Toast from '@/components/ui/Toast'
import ShareFallback from '@/components/ui/ShareFallback'
import { useBoardStore, serialise, SESSION_KEY } from '@/store/boardStore'
import { loadInitialBoard } from '@/store/boot'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useURLState } from '@/hooks/useURLState'
import { useIsDesk } from '@/hooks/useMedia'

function useAutoSave() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const unsub = useBoardStore.subscribe((state) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(serialise(state))) } catch { /* ignore */ }
      }, 500)
    })
    return () => { unsub(); clearTimeout(timer) }
  }, [])
}

export default function App() {
  const isDesk = useIsDesk()
  useKeyboardShortcuts()
  useURLState()
  useAutoSave()

  useEffect(() => { loadInitialBoard() }, [])

  return (
    <div className="app">
      <a className="skip" href="#pitch">Skip to the pitch</a>
      <Header />
      <main className="stage">
        <section className="board" aria-label="Board">
          <ToolStrip />
          <BoardCanvas />
          {!isDesk && <Dock />}
        </section>
        {isDesk && <MatchSheet />}
      </main>
      <PhoneBar />

      {!isDesk && <NotesSheet />}
      {!isDesk && <ShapeSheet />}
      {!isDesk && <MoreSheet />}
      <SaveLoadModal />
      <Confirms />
      <ShareFallback />
      <Toast />
    </div>
  )
}
