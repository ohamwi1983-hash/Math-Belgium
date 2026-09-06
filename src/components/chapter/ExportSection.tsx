import { useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import { runExport } from '../../lib/export/runExport'

/** Section "Télécharger ce chapitre" — export HTML (A4), en bas de chaque page de chapitre. */
export function ExportSection({ chapter }: { chapter: ChapterContent }) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [isError, setIsError] = useState(false)
  // Évite d'afficher le statut d'une génération déjà abandonnée si l'utilisateur relance vite.
  const requestId = useRef(0)

  async function handleClick() {
    const id = ++requestId.current
    setBusy(true)
    setIsError(false)
    setStatus('Préparation…')
    try {
      await runExport(chapter, ({ done, total }) => {
        if (requestId.current !== id) return
        setStatus(total > 0 ? `Génération… (${done}/${total})` : 'Assemblage du document…')
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
      if (requestId.current === id) setBusy(false)
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
        <button type="button" className="export-btn" disabled={busy} onClick={handleClick}>
          <span className="export-icon" aria-hidden="true">
            🌐
          </span>
          <span className="export-label">HTML (A4)</span>
          <span className="export-sub">.html — imprimable, hors ligne</span>
        </button>
      </div>
      <p className={`export-status${isError ? ' is-error' : ''}`}>{status}</p>
    </div>
  )
}
