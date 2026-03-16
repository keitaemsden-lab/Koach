import { Sun, Moon } from '@phosphor-icons/react'
import { useBoardStore } from '@/store/boardStore'

export default function ThemeToggle() {
  const isDarkMode     = useBoardStore((s) => s.isDarkMode)
  const toggleDarkMode = useBoardStore((s) => s.toggleDarkMode)

  return (
    <button
      onClick={toggleDarkMode}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center justify-center rounded-lg transition-colors duration-150"
      style={{
        minWidth: 44, minHeight: 44, width: 36, height: 36,
        color: 'var(--text-secondary)',
      }}
    >
      {isDarkMode ? (
        <Sun size={18} weight="light" />
      ) : (
        <Moon size={18} weight="light" />
      )}
    </button>
  )
}
