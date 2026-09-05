import type { ChapterContent } from '../../content/types'
import type { ExportFormat, ExportProgress } from './types'
import { collectBlocks } from './collectBlocks'
import { captureBlocks } from './captureBlocks'
import { downloadBlob } from './downloadBlob'

const EXTENSIONS: Record<ExportFormat, string> = { docx: 'docx', pdf: 'pdf', pptx: 'pptx', html: 'html' }

function filenameFor(chapter: ChapterContent, format: ExportFormat): string {
  return `chapitre-${chapter.chapterNumber}-${chapter.slug}.${EXTENSIONS[format]}`
}

/** Diagrammes jugés trop grands une fois exportés (Word/PDF/PowerPoint/HTML A4) — règle GÉNÉRALE,
 * tout chapitre confondu, portant UNIQUEMENT sur l'export, jamais sur le site en ligne (où les
 * diagrammes gardent leur taille normale, `width: 100%` dans `src/index.css`). */
const ECHELLE_DIAGRAMMES_EXPORT = 40

/** Réduit temporairement tous les diagrammes autonomes avant `fn`, puis restaure l'état d'origine —
 * même mécanisme que `withLightTheme()` (`captureBlocks.ts`) : un `<style>` injecté dans `<head>`
 * pendant l'export, retiré aussitôt après. Réduit le CADRE (`.diagram-frame`, bordure + fond) lui-
 * même, pas seulement le SVG à l'intérieur : réduire uniquement le SVG laissait le cadre en pleine
 * largeur avec le dessin flottant au milieu, entouré de vide inutile — demande explicite de réduire
 * l'espace réellement occupé dans la page, pas seulement le dessin. Le SVG repasse donc à 100% (il
 * remplit son cadre déjà réduit) et c'est le cadre qui porte les 60% + centrage.
 *
 * Exclut les mini-diagrammes d'un `illustrationGroup` (`.diag-multi`) : déjà réduits par leur
 * propre colonne de grille, un second rétrécissement à 60% de cette largeur les rend illisibles
 * (labels A/B/θ/m). Couvre les 4 formats d'un seul point : `captureBlocks`/html2canvas
 * (docx/pdf/pptx) lit les styles calculés au moment de la capture, et `buildHtml.ts` copie
 * `document.styleSheets` au moment de l'export — cette règle temporaire est donc visible des deux
 * pipelines sans dupliquer la logique.
 *
 * Exclut aussi le cadre contenant `.svg-cavaliere-axes` (le cube annoté des 3 axes, chapitre
 * « Géométrie dans l'espace ») — bug confirmé de html2canvas, PAS de ce site : dès que ce SVG
 * précis passe par un `width` en `%`, html2canvas perd la ligne ET l'étiquette de l'axe x
 * (horizontal, avec marker de flèche), quelle que soit la position exacte de cette ligne dans le
 * viewBox — reproduit isolément hors de l'app (repro minimal avec le même html2canvas.js, sans le
 * reste du site), et confirmé absent à 100% (`width` fixe, jamais en `%`). `:has()` cible le cadre
 * parent depuis la classe posée sur le SVG enfant — pas besoin de dupliquer le marquage sur le
 * cadre lui-même, supporté par tout Chromium assez récent pour exécuter ce site. */
async function withDiagrammesReduitsAExport<T>(fn: () => Promise<T>): Promise<T> {
  const style = document.createElement('style')
  style.textContent = `
    .diagram-frame { width: ${ECHELLE_DIAGRAMMES_EXPORT}% !important; margin: 0 auto !important; }
    .diagram-frame svg { width: 100% !important; margin: 0 !important; }
    .diag-multi .diagram-frame { width: 100% !important; margin: 0 !important; }
    .diagram-frame:has(svg.svg-cavaliere-axes) { width: 100% !important; margin: 0 !important; }
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
  return withDiagrammesReduitsAExport(async () => {
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
