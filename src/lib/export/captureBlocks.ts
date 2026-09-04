import type { CapturedBlock, ExportProgress } from './types'

// Rendre à une largeur de CONCEPTION fixe (contenu principal en max-width:760px + marges),
// indépendante de la largeur réelle de la fenêtre du lecteur au moment du clic.
const CAPTURE_WINDOW_WIDTH = 900
const RENDER_SCALE = 1.6
const JPEG_QUALITY = 0.85

/** Force le thème clair (impression toujours claire) pendant la capture, puis restaure l'état d'origine. */
async function withLightTheme<T>(fn: () => Promise<T>): Promise<T> {
  const root = document.documentElement
  const hadAttr = root.hasAttribute('data-theme')
  const prevValue = root.getAttribute('data-theme')
  root.setAttribute('data-theme', 'light')
  try {
    return await fn()
  } finally {
    if (hadAttr) root.setAttribute('data-theme', prevValue!)
    else root.removeAttribute('data-theme')
  }
}

/**
 * html2canvas ne résout pas de façon fiable une largeur CSS en pourcentage sur un `<svg>` (confirmé
 * sur `.chapter-geometrie-analytique-plane .diagram-frame svg { width: 60% }` : capturé à sa taille
 * quasi complète, pas 60%). Fige la taille RENDUE (déjà correcte, lue sur la page en direct) en
 * pixels explicites juste avant la capture, pour ne plus dépendre de la résolution CSS par
 * html2canvas — restaure l'état d'origine juste après, quoi qu'il arrive.
 */
function pinSvgSizes(block: HTMLElement): () => void {
  const svgs = Array.from(block.querySelectorAll('svg'))
  const restores = svgs.map((svg) => {
    const prevWidth = svg.style.width
    const prevHeight = svg.style.height
    const rect = svg.getBoundingClientRect()
    svg.style.width = `${rect.width}px`
    svg.style.height = `${rect.height}px`
    return () => {
      svg.style.width = prevWidth
      svg.style.height = prevHeight
    }
  })
  return () => restores.forEach((restore) => restore())
}

/** Capture chaque bloc DOM en une image JPEG, à sa taille naturelle (CSS px). */
export async function captureBlocks(
  blocks: HTMLElement[],
  onProgress: (progress: ExportProgress) => void,
): Promise<CapturedBlock[]> {
  return withLightTheme(async () => {
    // Bibliothèque lourde : chargée à la demande, seulement quand un export est réellement déclenché.
    const { default: html2canvas } = await import('html2canvas')
    const images: CapturedBlock[] = []
    for (let i = 0; i < blocks.length; i++) {
      onProgress({ done: i, total: blocks.length })
      const unpin = pinSvgSizes(blocks[i])
      let canvas
      try {
        canvas = await html2canvas(blocks[i], {
          scale: RENDER_SCALE,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          windowWidth: CAPTURE_WINDOW_WIDTH,
        })
      } finally {
        unpin()
      }
      images.push({
        dataUrl: canvas.toDataURL('image/jpeg', JPEG_QUALITY),
        widthPx: canvas.width / RENDER_SCALE,
        heightPx: canvas.height / RENDER_SCALE,
      })
      // Laisse le thread respirer entre deux captures (évite un gel visible sur un long chapitre).
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
    onProgress({ done: blocks.length, total: blocks.length })
    return images
  })
}
