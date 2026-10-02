import { useLayoutEffect, useRef } from 'react'
import { useBoardStore, DEFAULT_TITLE } from '@/store/boardStore'
import { shareBoard } from '@/utils/share'
import { exportToPNG } from '@/utils/export'

/** The board title is the page heading, editable in place. */
function Title() {
  const title = useBoardStore((s) => s.title)
  const setTitle = useBoardStore((s) => s.setTitle)
  const ref = useRef<HTMLHeadingElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (el && document.activeElement !== el && el.textContent !== title) el.textContent = title
  }, [title])
  return (
    <h1
      ref={ref}
      id="title"
      className="title"
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      aria-label={`Board title: ${title}. Editable.`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); e.currentTarget.blur() } }}
      onBlur={(e) => {
        const t = (e.currentTarget.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80) || DEFAULT_TITLE
        e.currentTarget.textContent = t
        if (t !== useBoardStore.getState().title) setTitle(t)
      }}
    />
  )
}

export default function Header() {
  const home = useBoardStore((s) => s.activeFormation)
  const away = useBoardStore((s) => s.awayFormation)
  const homeColour = useBoardStore((s) => s.homeColour)
  const awayColour = useBoardStore((s) => s.awayColour)
  const players = useBoardStore((s) => s.players.length)
  const arrows = useBoardStore((s) => s.arrows.length)
  const toggleSaveLoadModal = useBoardStore((s) => s.toggleSaveLoadModal)
  const h = home ?? 'Custom', a = away ?? 'Custom'

  return (
    <header className="top">
      <a className="brand" href="./" aria-label="Koach home"><span className="mark" aria-hidden="true" />Koach</a>
      <div className="bug mono desk" aria-hidden="true">
        <span><i style={{ background: homeColour }} />Home <b>{h}</b></span>
        <span><i style={{ background: awayColour }} />Opp <b>{a}</b></span>
      </div>
      <div className="titlebox">
        <Title />
        <p className="meta mono">
          <span>{h} v {a}</span><span aria-hidden="true">/</span>
          <span>{players} players</span><span aria-hidden="true">/</span>
          <span>{arrows} {arrows === 1 ? 'arrow' : 'arrows'}</span>
        </p>
      </div>
      <div className="acts desk">
        <button className="btn quiet" onClick={toggleSaveLoadModal}>Boards</button>
        <button className="btn quiet" onClick={() => void shareBoard()}>Share link</button>
        <button className="btn solid" onClick={() => void exportToPNG()}>Export PNG</button>
      </div>
    </header>
  )
}
