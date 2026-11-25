import type { ChapterContent } from '../../content/types'
import type { ExportProgress } from './types'
import { downloadBlob } from './downloadBlob'

/** Télécharge le chapitre courant en HTML (A4) — seul format d'export du site ; `amenage` : le
 * fichier s'imprime en version aménagée. */
export async function runExport(chapter: ChapterContent, onProgress: (progress: ExportProgress) => void, amenage = false): Promise<void> {
  onProgress({ done: 0, total: 0 })
  const { buildHtmlBlob } = await import('./buildHtml')
  const blob = await buildHtmlBlob(chapter, amenage)
  downloadBlob(blob, `${chapter.levelSlug}-${chapter.slug}${amenage ? '-amenage' : ''}.html`)
}
