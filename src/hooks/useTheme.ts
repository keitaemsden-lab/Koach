import { useState, useEffect } from 'react'

const STORAGE_KEY = 'tactic-board:dark-mode'

function getInitialDark(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyDark(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
}

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const initial = getInitialDark()
    applyDark(initial)
    return initial
  })

  useEffect(() => {
    applyDark(isDark)
    localStorage.setItem(STORAGE_KEY, String(isDark))
  }, [isDark])

  const toggle = () => setIsDark((prev) => !prev)

  return { isDark, toggle }
}
