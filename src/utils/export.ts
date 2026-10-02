import { boardDom } from '@/play/boardDom'
import { useBoardStore } from '@/store/boardStore'
import { toast } from '@/store/uiStore'

/** Fonts embedded into the exported image so it never falls back to system type. */
const FONTS = [
  { family: 'Switzer', weight: 600, url: '/fonts/switzer-600.woff2' },
  { family: 'Switzer', weight: 700, url: '/fonts/switzer-700.woff2' },
  { family: 'DM Mono', weight: 500, url: '/fonts/dm-mono-500.woff2' },
]

const PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity',
  'font-family', 'font-size', 'font-weight', 'letter-spacing', 'text-anchor', 'display', 'paint-order']

export function exportFileName(title: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  return `koach-${slug || 'board'}.png`
}

async function fontCss() {
  let css = ''
  for (const f of FONTS) {
    try {
      const buf = new Uint8Array(await (await fetch(f.url)).arrayBuffer())
      let bin = ''
      for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode(...buf.subarray(i, i + 8192))
      css += `@font-face{font-family:"${f.family}";font-weight:${f.weight};src:url(data:font/woff2;base64,${btoa(bin)}) format("woff2");}`
    } catch { /* system fallback */ }
  }
  return css
}

/**
 * Export the pitch as a PNG: the live SVG with computed styles inlined and the fonts embedded,
 * on the page colour, with the board title and both shapes in a footer.
 */
export async function exportToPNG(): Promise<void> {
  const svg = boardDom.svg
  if (!svg) return
  toast('Building the image')
  try {
    const clone = svg.cloneNode(true) as SVGSVGElement
    const a = [svg, ...svg.querySelectorAll('*')]
    const b = [clone, ...clone.querySelectorAll('*')]
    a.forEach((n, i) => {
      const cs = getComputedStyle(n)
      const target = b[i] as SVGElement
      PROPS.forEach((k) => { const v = cs.getPropertyValue(k); if (v) target.style.setProperty(k, v) })
    })
    clone.querySelectorAll('.hit, .ring, .hitp, .spotlight, .ball, .capture, .handlewrap, .startdot, .draft').forEach((n) => n.remove())
    const r = svg.getBoundingClientRect()
    const sc = Math.max(2, Math.ceil(2400 / Math.max(1, r.width)))
    clone.setAttribute('width', String(r.width * sc))
    clone.setAttribute('height', String(r.height * sc))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const st = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    st.textContent = await fontCss()
    clone.insertBefore(st, clone.firstChild)

    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }))
    const img = new Image()
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })

    const s = useBoardStore.getState()
    const root = getComputedStyle(document.documentElement)
    const pad = 28 * sc, foot = 56 * sc
    const c = document.createElement('canvas')
    c.width = r.width * sc + pad * 2
    c.height = r.height * sc + pad * 2 + foot
    const x = c.getContext('2d')
    if (!x) throw new Error('no canvas')
    x.fillStyle = root.getPropertyValue('--bg').trim() || '#0A0F0C'
    x.fillRect(0, 0, c.width, c.height)
    x.drawImage(img, pad, pad, r.width * sc, r.height * sc)
    URL.revokeObjectURL(url)
    x.fillStyle = root.getPropertyValue('--fg').trim() || '#EEF2EA'
    x.font = `600 ${18 * sc}px Switzer, sans-serif`
    x.fillText(s.title, pad, c.height - foot / 2 - 2 * sc)
    x.fillStyle = root.getPropertyValue('--muted').trim() || '#93A096'
    x.font = `500 ${13 * sc}px "DM Mono", monospace`
    x.textAlign = 'right'
    x.fillText(`KOACH  ${s.activeFormation ?? 'Custom'} v ${s.awayFormation ?? 'Custom'}`, c.width - pad, c.height - foot / 2 - 2 * sc)

    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'))
    if (!blob) throw new Error('no blob')
    const dl = document.createElement('a')
    dl.download = exportFileName(s.title)
    dl.href = URL.createObjectURL(blob)
    document.body.appendChild(dl)
    dl.click()
    dl.remove()
    setTimeout(() => URL.revokeObjectURL(dl.href), 4000)
    toast('Image saved: ' + dl.download)
  } catch {
    toast('Export failed in this browser. Try again, or use a screenshot.')
  }
}
