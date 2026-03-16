import { useBoardStore } from '@/store/boardStore'

export default function TeamColourPicker() {
  const homeColour    = useBoardStore((s) => s.homeColour)
  const awayColour    = useBoardStore((s) => s.awayColour)
  const setHomeColour = useBoardStore((s) => s.setHomeColour)
  const setAwayColour = useBoardStore((s) => s.setAwayColour)

  return (
    <div className="flex items-center gap-2">
      <label title="Home team colour" className="relative" style={{ cursor: 'pointer' }}>
        <span className="text-xs mr-1" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>H</span>
        <span
          className="inline-block rounded-full border-2 border-white/30"
          style={{ width: 20, height: 20, background: homeColour, verticalAlign: 'middle' }}
        />
        <input
          type="color"
          value={homeColour}
          onChange={(e) => setHomeColour(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          title="Home team colour"
        />
      </label>
      <label title="Away team colour" className="relative" style={{ cursor: 'pointer' }}>
        <span className="text-xs mr-1" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>A</span>
        <span
          className="inline-block rounded-full border-2 border-white/30"
          style={{ width: 20, height: 20, background: awayColour, verticalAlign: 'middle' }}
        />
        <input
          type="color"
          value={awayColour}
          onChange={(e) => setAwayColour(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          title="Away team colour"
        />
      </label>
    </div>
  )
}
