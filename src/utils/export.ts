import { toPng } from 'html-to-image'
import type { RefObject } from 'react'

export async function exportToPNG(boardRef: RefObject<HTMLDivElement | null>): Promise<void> {
  if (!boardRef.current) return
  try {
    const dataUrl = await toPng(boardRef.current, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: 'transparent',
      // Skip cross-origin stylesheet <link> elements to avoid SecurityError
      // when html-to-image tries to read cssRules from Google Fonts
      filter: (node: HTMLElement) => {
        if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
          const href = (node as HTMLLinkElement).href || ''
          if (href.startsWith('http') && !href.startsWith(window.location.origin)) {
            return false
          }
        }
        return true
      },
    })
    const link = document.createElement('a')
    link.download = `tactic-board-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  } catch (err) {
    console.error('Export failed:', err)
    alert('Export failed. Please try again.')
  }
}
