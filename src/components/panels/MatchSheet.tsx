import FormationGrid from './FormationGrid'
import SelectionCard from './SelectionCard'
import Kits from './Kits'
import Display from './Display'
import { NotesField, NotesCount } from './NotesPanel'

/** Desktop match sheet beside the pitch: both shapes, the selection, kits and coaching notes. */
export default function MatchSheet() {
  return (
    <aside className="panel desk" aria-label="Match sheet">
      <section className="blk">
        <h2>Home shape</h2>
        <FormationGrid team="home" />
      </section>
      <section className="blk">
        <h2>Opposition shape</h2>
        <FormationGrid team="away" />
      </section>
      <section className="blk">
        <h2>Selected</h2>
        <SelectionCard />
      </section>
      <section className="blk grow">
        <h2><label htmlFor="notes-d">Coaching notes</label> <NotesCount /></h2>
        <NotesField id="notes-d" />
      </section>
      <section className="blk">
        <h2>Kits</h2>
        <Kits />
      </section>
      <section className="blk">
        <h2>Display</h2>
        <Display />
      </section>
      <p className="keys mono">V move / D draw / P play / N notes / Ctrl Z undo</p>
    </aside>
  )
}
