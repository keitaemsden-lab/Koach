import { toPng } from 'html-to-image'
import type { RefObject } from 'react'

export async function exportToPNG(boardRef: RefObject<HTMLDivElement | null>): Promise<void> {
  if (!boardRef.current) return
  const dataUrl = await toPng(boardRef.current, {
    quality: 1.0,
    pixelRatio: 2,
    backgroundColor: 'transparent',
  })
  const link = document.createElement('a')
  link.download = `tactic-board-${Date.now()}.png`
  link.href = dataUrl
  link.click()
}
