import { useBoardStore } from '@/store/boardStore'

/** Kit colours for both sides (the old H/A swatches, now labelled in full and AA on the page). */
export default function Kits() {
  const homeColour = useBoardStore((s) => s.homeColour)
  const awayColour = useBoardStore((s) => s.awayColour)
  const setHomeColour = useBoardStore((s) => s.setHomeColour)
  const setAwayColour = useBoardStore((s) => s.setAwayColour)
  return (
    <div className="kits">
      <label className="kit">
        <span className="sw" style={{ background: homeColour }} aria-hidden="true" />Home kit
        <input type="color" value={homeColour} onChange={(e) => setHomeColour(e.target.value)} aria-label="Home kit colour" />
      </label>
      <label className="kit">
        <span className="sw" style={{ background: awayColour }} aria-hidden="true" />Opp kit
        <input type="color" value={awayColour} onChange={(e) => setAwayColour(e.target.value)} aria-label="Opposition kit colour" />
      </label>
    </div>
  )
}
