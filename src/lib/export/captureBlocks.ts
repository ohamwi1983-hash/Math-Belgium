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
      const canvas = await html2canvas(blocks[i], {
        scale: RENDER_SCALE,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: CAPTURE_WINDOW_WIDTH,
      })
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
