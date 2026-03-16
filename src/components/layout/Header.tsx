import ThemeToggle from '@/components/ui/ThemeToggle'
import ShareButton from '@/components/ui/ShareButton'

export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-4 flex-shrink-0"
      style={{
        height: 48,
        backgroundColor: 'var(--bg-toolbar)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span
        className="font-medium tracking-widest uppercase select-none"
        style={{ fontSize: 13, fontFamily: 'DM Mono, monospace', color: 'var(--text-primary)' }}
      >
        Tactic Board
      </span>
      <div className="flex items-center gap-1">
        <ShareButton />
        <ThemeToggle />
      </div>
    </header>
  )
}
