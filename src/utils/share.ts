import { useBoardStore } from '@/store/boardStore'
import { useUI, toast } from '@/store/uiStore'

export async function shareUrl() {
  const encoded = await useBoardStore.getState().exportState()
  return { encoded, url: `${window.location.origin}${window.location.pathname}#state=${encoded}` }
}

/**
 * Copy a link that rebuilds this board. When the clipboard is blocked (insecure origin,
 * permission denied, old browser) the link opens in a dialog to copy by hand.
 */
export async function shareBoard() {
  const { encoded, url } = await shareUrl()
  try {
    if (!navigator.clipboard?.writeText) throw new Error('no clipboard')
    await navigator.clipboard.writeText(url)
    window.history.replaceState(null, '', `#state=${encoded}`)
    toast('Link copied. Anyone with it sees this board.')
  } catch {
    useUI.getState().setShareFallback(url)
  }
}
