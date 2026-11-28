import { useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import { runExport } from '../../lib/export/runExport'
import { imprimerChapitre, imprimerChapitreAmenage } from '../../lib/imprimer'

/** Section « Imprimer ou télécharger ce chapitre », en bas de chaque page de chapitre : impression
 * directe (version normale ou aménagée, comme le menu « Imprimer » du sommaire) et fichier HTML (A4)
 * à télécharger, lui aussi en version normale ou aménagée (le fichier aménagé s'imprime avec la mise
 * en page aménagée). */
export function ExportSection({ chapter }: { chapter: ChapterContent }) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [isError, setIsError] = useState(false)
  // Évite d'afficher le statut d'une génération déjà abandonnée si l'utilisateur relance vite.
  const requestId = useRef(0)

  async function handleClick(amenage: boolean) {
    const id = ++requestId.current
    setBusy(true)
    setIsError(false)
    setStatus('Préparation…')
    try {
      await runExport(
        chapter,
        ({ done, total }) => {
          if (requestId.current !== id) return
          setStatus(total > 0 ? `Génération… (${done}/${total})` : 'Assemblage du document…')
        },
        amenage,
      )
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
      <h2>Imprimer ou télécharger ce chapitre</h2>
      <p>
        Une version imprimable du cours (texte, exemples, graphiques) — sans les boutons d'exercices ni le sommaire, et
        sans jamais couper un exemple ou un graphique en changeant de page. La version aménagée garde le même contenu
        avec une mise en page plus aérée : grande police lisible, texte non justifié, un point par page.
      </p>
      <div className="export-buttons">
        <button type="button" className="export-btn" onClick={imprimerChapitre}>
          <span className="export-icon" aria-hidden="true">
            🖨️
          </span>
          <span className="export-label">Imprimer</span>
          <span className="export-sub">ou enregistrer en PDF</span>
        </button>
        <button type="button" className="export-btn" onClick={imprimerChapitreAmenage}>
          <span className="export-icon" aria-hidden="true">
            🖨️
          </span>
          <span className="export-label">Imprimer — version aménagée</span>
          <span className="export-sub">ou enregistrer en PDF</span>
        </button>
        <button type="button" className="export-btn" disabled={busy} onClick={() => void handleClick(false)}>
          <span className="export-icon" aria-hidden="true">
            🌐
          </span>
          <span className="export-label">HTML (A4)</span>
          <span className="export-sub">.html — imprimable, hors ligne</span>
        </button>
        <button type="button" className="export-btn" disabled={busy} onClick={() => void handleClick(true)}>
          <span className="export-icon" aria-hidden="true">
            🌐
          </span>
          <span className="export-label">HTML (A4) — version aménagée</span>
          <span className="export-sub">.html — s'imprime en version aménagée</span>
        </button>
      </div>
      <p className={`export-status${isError ? ' is-error' : ''}`}>{status}</p>
    </div>
  )
}
