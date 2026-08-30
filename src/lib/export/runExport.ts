import type { ChapterContent } from '../../content/types'
import type { ExportFormat, ExportProgress } from './types'
import { collectBlocks } from './collectBlocks'
import { captureBlocks } from './captureBlocks'
import { downloadBlob } from './downloadBlob'

const EXTENSIONS: Record<ExportFormat, string> = { docx: 'docx', pdf: 'pdf', pptx: 'pptx' }

function filenameFor(chapter: ChapterContent, format: ExportFormat): string {
  return `chapitre-${chapter.chapterNumber}-${chapter.slug}.${EXTENSIONS[format]}`
}

/** Capture le chapitre courant et télécharge l'export demandé. */
export async function runExport(
  format: ExportFormat,
  chapter: ChapterContent,
  onProgress: (progress: ExportProgress) => void,
): Promise<void> {
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
}
