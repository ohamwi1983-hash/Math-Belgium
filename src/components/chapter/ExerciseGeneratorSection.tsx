import { Link } from 'react-router-dom'
import type { ChapterContent } from '../../content/types'
import { estChapitreFonctionnel } from '../../lib/chapitresFonctionnels'

/** Section "S'entraîner sur ce chapitre" — lien vers `/{levelSlug}/{slug}/exercices`
 * (`ChapterExercicePage.tsx`, page publique élève), juste AVANT `ExportSection` en bas de chaque
 * page de chapitre. N'apparaît que pour un chapitre déjà câblé côté plateforme-maths (voir
 * `estChapitreFonctionnel`) — sinon la page cible n'aurait aucun générateur à proposer. */
export function ExerciseGeneratorSection({ chapter }: { chapter: ChapterContent }) {
  if (!estChapitreFonctionnel(chapter.levelSlug, chapter.slug)) return null

  return (
    <div className="export-section no-export">
      <h2>S'entraîner sur ce chapitre</h2>
      <p>Prépare ton évaluation : une feuille d'exercices ou une évaluation blanche sur ce chapitre (corrigé détaillé, nouveaux exercices à chaque génération).</p>
      <div className="export-buttons">
        <Link className="export-btn" to={`/${chapter.levelSlug}/${chapter.slug}/exercices`}>
          <span className="export-icon" aria-hidden="true">
            📝
          </span>
          <span className="export-label">Me préparer à l'évaluation</span>
          <span className="export-sub">feuille d'exercices ou évaluation blanche</span>
        </Link>
      </div>
    </div>
  )
}
