import { useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import type { ExportFormat } from '../../lib/export/types'
import { runExport } from '../../lib/export/runExport'

const FORMATS: { format: ExportFormat; icon: string; label: string; sub: string }[] = [
  { format: 'docx', icon: '📄', label: 'Word', sub: '.docx — A4' },
  { format: 'pdf', icon: '🖨️', label: 'PDF', sub: '.pdf — A4' },
  { format: 'pptx', icon: '🖥️', label: 'PowerPoint', sub: '.pptx — diapositives' },
]

const FORMAT_LABEL: Record<ExportFormat, string> = { docx: 'Word', pdf: 'PDF', pptx: 'PowerPoint' }

/** Section "Télécharger ce chapitre" — export Word/PDF/PowerPoint, en bas de chaque page de chapitre. */
export function ExportSection({ chapter }: { chapter: ChapterContent }) {
  const [busyFormat, setBusyFormat] = useState<ExportFormat | null>(null)
  const [status, setStatus] = useState('')
  const [isError, setIsError] = useState(false)
  // Évite d'afficher le statut d'une génération déjà abandonnée si l'utilisateur relance vite.
  const requestId = useRef(0)

  async function handleClick(format: ExportFormat) {
    const id = ++requestId.current
    setBusyFormat(format)
    setIsError(false)
    setStatus(`Préparation (${FORMAT_LABEL[format]})…`)
    try {
      await runExport(format, chapter, ({ done, total }) => {
        if (requestId.current !== id) return
        setStatus(total > 0 ? `Génération ${FORMAT_LABEL[format]}… (${done}/${total})` : `Assemblage du document ${FORMAT_LABEL[format]}…`)
      })
      if (requestId.current !== id) return
      setStatus('Téléchargé ✓')
      setTimeout(() => {
        if (requestId.current === id) setStatus('')
      }, 3000)
    } catch (err) {
      if (requestId.current !== id) return
      console.error('Export failed:', err)
      setIsError(true)
      setStatus('Le téléchargement a échoué — réessaie.')
    } finally {
      if (requestId.current === id) setBusyFormat(null)
    }
  }

  return (
    <div className="export-section no-export">
      <h2>Télécharger ce chapitre</h2>
      <p>
        Une version imprimable du cours (texte, exemples, graphiques) — sans les boutons d'exercices ni le sommaire, et
        sans jamais couper un exemple ou un graphique en changeant de page.
      </p>
      <div className="export-buttons">
        {FORMATS.map(({ format, icon, label, sub }) => (
          <button
            key={format}
            type="button"
            className="export-btn"
            disabled={busyFormat !== null}
            onClick={() => handleClick(format)}
          >
            <span className="export-icon" aria-hidden="true">
              {icon}
            </span>
            <span className="export-label">{label}</span>
            <span className="export-sub">{sub}</span>
          </button>
        ))}
      </div>
      <p className={`export-status${isError ? ' is-error' : ''}`}>{status}</p>
    </div>
  )
}
