import type { CapturedBlock, ExportProgress } from './types'

// Rendre à une largeur de CONCEPTION fixe (contenu principal en max-width:760px + marges),
// indépendante de la largeur réelle de la fenêtre du lecteur au moment du clic.
const CAPTURE_WINDOW_WIDTH = 900
const RENDER_SCALE = 1.6
const JPEG_QUALITY = 0.85
// Un diagramme peut déborder légèrement de son .diagram-frame par construction (`overflow:
// visible` en CSS, pour ne pas tronquer une étiquette proche du bord du viewBox à l'écran) —
// html2canvas ne capture que la boîte de l'élément passé, donc sans cette marge, tout débordement
// est rogné net dans le PDF/Word/PPTX généré. Marge PROPORTIONNELLE (jamais mesurée sur un
// diagramme précis) pour rester valable pour tout diagramme futur ou redimensionné, quelle que
// soit la largeur d'écran du visiteur (une mesure en direct serait faite à la largeur réelle de
// son écran, alors que la capture est forcée à CAPTURE_WINDOW_WIDTH — les deux ne correspondent
// pas forcément).
const OVERFLOW_MARGIN_RATIO = 0.12
// Si le débordement réel dépasse ça, ce n'est plus un débordement "normal" (étiquette/tracé en
// bord de cadre) mais le symptôme d'un AUTRE bug (ex. transform cassé) — l'absorber
// silencieusement produirait un canvas démesuré (voire un crash de l'API Canvas). Dans ce cas on
// n'élargit pas la capture et on signale l'anomalie au lieu de l'escamoter.
const MAX_OVERFLOW_MARGIN_PX = 160

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

/** Débordement RÉEL mesuré (diagnostic uniquement, jamais utilisé pour dimensionner la capture —
 * voir le commentaire sur OVERFLOW_MARGIN_RATIO). Sert à logguer une anomalie (ex. un transform
 * cassé sur un composant d'illustration) sans jamais tenter de l'absorber. */
function debugMeasureOverflow(block: HTMLElement): number {
  const blockBox = block.getBoundingClientRect()
  let max = 0
  block.querySelectorAll('*').forEach((el) => {
    const box = el.getBoundingClientRect()
    if (box.width === 0 && box.height === 0) return
    max = Math.max(max, blockBox.left - box.left, blockBox.top - box.top, box.right - blockBox.right, box.bottom - blockBox.bottom)
  })
  return max
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
      const box = blocks[i].getBoundingClientRect()
      const margin = Math.min(Math.max(box.width, box.height) * OVERFLOW_MARGIN_RATIO, MAX_OVERFLOW_MARGIN_PX)
      const measured = debugMeasureOverflow(blocks[i])
      if (measured > margin) {
        console.warn(
          `[export] débordement de ${Math.round(measured)}px sur un bloc dont la marge de sécurité n'est que ${Math.round(margin)}px — probable bug de rendu distinct (transform cassé ?), pas absorbé par ce mécanisme.`,
          blocks[i],
        )
      }
      const canvas = await html2canvas(blocks[i], {
        scale: RENDER_SCALE,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: CAPTURE_WINDOW_WIDTH,
        x: -margin,
        y: -margin,
        width: box.width + margin * 2,
        height: box.height + margin * 2,
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
