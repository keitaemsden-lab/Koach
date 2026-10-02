import { useBoardStore } from '@/store/boardStore'
import { useDisplay } from '@/components/controls/actions'

export default function Display() {
  const d = useDisplay()
  const pref = useBoardStore((s) => s.orientationPref)
  const setOrientationPref = useBoardStore((s) => s.setOrientationPref)
  return (
    <div className="disp">
      <button className="btn" onClick={d.rotate}>Rotate pitch</button>
      {pref && <button className="btn quiet" onClick={() => setOrientationPref(null)}>Fit to screen</button>}
      <button className="btn quiet" onClick={d.toggleTheme}>{d.themeLabel}</button>
    </div>
  )
}
