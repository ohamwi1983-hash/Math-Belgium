import type { ChapterContent } from '../../content/types'
import type { ExportFormat, ExportProgress } from './types'
import { collectBlocks } from './collectBlocks'
import { captureBlocks } from './captureBlocks'
import { downloadBlob } from './downloadBlob'

const EXTENSIONS: Record<ExportFormat, string> = { docx: 'docx', pdf: 'pdf', pptx: 'pptx', html: 'html' }

function filenameFor(chapter: ChapterContent, format: ExportFormat): string {
  return `chapitre-${chapter.chapterNumber}-${chapter.slug}.${EXTENSIONS[format]}`
}

/** Chapitre dont les diagrammes sont jugés trop grands une fois exportés (Word/PDF/PowerPoint/HTML
 * A4) — demande explicite portant UNIQUEMENT sur l'export, jamais sur le site en ligne (où les
 * diagrammes gardent leur taille normale, `width: 100%` dans `src/index.css`). */
const CHAPITRE_DIAGRAMMES_REDUITS_A_EXPORT = 'geometrie-analytique-plane'
const ECHELLE_DIAGRAMMES_EXPORT = 60

/** Réduit temporairement les diagrammes de `chapter` (si concerné) avant `fn`, puis restaure l'état
 * d'origine — même mécanisme que `withLightTheme()` (`captureBlocks.ts`) : un `<style>` injecté
 * dans `<head>` pendant l'export, retiré aussitôt après. Couvre les 4 formats d'un seul point :
 * `captureBlocks`/html2canvas (docx/pdf/pptx) lit les styles calculés au moment de la capture, et
 * `buildHtml.ts` copie `document.styleSheets` au moment de l'export — cette règle temporaire est
 * donc visible des deux pipelines sans dupliquer la logique. */
async function withDiagrammesReduitsAExport<T>(chapter: ChapterContent, fn: () => Promise<T>): Promise<T> {
  if (chapter.slug !== CHAPITRE_DIAGRAMMES_REDUITS_A_EXPORT) return fn()
  const style = document.createElement('style')
  // Exclut les mini-diagrammes d'un `illustrationGroup` (`.diag-multi`) : déjà réduits par leur
  // propre colonne de grille, un second rétrécissement à 60% de cette largeur les rend illisibles
  // (labels A/B/θ/m) — même exclusion que l'ancienne règle CSS permanente que ce mécanisme remplace.
  style.textContent = `
    .diagram-frame svg { width: ${ECHELLE_DIAGRAMMES_EXPORT}% !important; margin: 0 auto !important; }
    .diag-multi .diagram-frame svg { width: 100% !important; margin: 0 !important; }
  `
  document.head.appendChild(style)
  try {
    return await fn()
  } finally {
    style.remove()
  }
}

/** Capture le chapitre courant et télécharge l'export demandé. */
export async function runExport(
  format: ExportFormat,
  chapter: ChapterContent,
  onProgress: (progress: ExportProgress) => void,
): Promise<void> {
  return withDiagrammesReduitsAExport(chapter, async () => {
    // HTML (A4) reste du vrai DOM (formules KaTeX sélectionnables, mise en page CSS normale) —
    // jamais rasterisé via html2canvas, contrairement aux 3 autres formats : voir l'en-tête de
    // `buildHtml.ts`. Ne passe donc jamais par `collectBlocks`/`captureBlocks`.
    if (format === 'html') {
      onProgress({ done: 0, total: 0 })
      const { buildHtmlBlob } = await import('./buildHtml')
      const blob = await buildHtmlBlob(chapter)
      downloadBlob(blob, filenameFor(chapter, format))
      return
    }

    const blocks = collectBlocks()
    const images = await captureBlocks(blocks, onProgress)

    // Chaque bibliothèque de génération (docx/jspdf/pptxgenjs) est lourde et spécifique à un seul
    // format : chargée à la demande pour ne pas alourdir le chargement initial de la page de cours.
    let blob: Blob
    if (format === 'pdf') {
      const { buildPdfBlob } = await import('./buildPdf')
      blob = buildPdfBlob(images)
    } else if (format === 'docx') {
      const { buildDocxBlob } = await import('./buildDocx')
      blob = await buildDocxBlob(images)
    } else {
      const { buildPptxBlob } = await import('./buildPptx')
      blob = await buildPptxBlob(images)
    }

    downloadBlob(blob, filenameFor(chapter, format))
  })
}
