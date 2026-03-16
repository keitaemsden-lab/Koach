import ThemeToggle from '@/components/ui/ThemeToggle'
import ShareButton from '@/components/ui/ShareButton'

export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-4 flex-shrink-0"
      style={{
        height: 44,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span
        className="font-semibold tracking-widest uppercase select-none"
        style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', letterSpacing: '0.12em' }}
      >
        Koach
      </span>
      <div className="flex items-center gap-1">
        <ShareButton />
        <ThemeToggle />
      </div>
    </header>
  )
}
