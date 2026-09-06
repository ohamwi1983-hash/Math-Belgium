import type { ChapterContent } from '../../content/types'
import type { ExportProgress } from './types'
import { downloadBlob } from './downloadBlob'

/** Télécharge le chapitre courant en HTML (A4) — seul format d'export du site. */
export async function runExport(chapter: ChapterContent, onProgress: (progress: ExportProgress) => void): Promise<void> {
  onProgress({ done: 0, total: 0 })
  const { buildHtmlBlob } = await import('./buildHtml')
  const blob = await buildHtmlBlob(chapter)
  downloadBlob(blob, `chapitre-${chapter.chapterNumber}-${chapter.slug}.html`)
}
