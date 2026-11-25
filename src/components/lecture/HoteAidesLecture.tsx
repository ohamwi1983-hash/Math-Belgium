import { lazy, Suspense } from 'react'
import { useReglagesLecture } from '../../lib/reglagesLecture'

/** Code des aides chargé SEULEMENT quand l'élève en active une (aucun poids sinon). */
const AidesLecture = lazy(() => import('./AidesLecture'))

/**
 * Hôte unique des aides de lecture de l'onglet « Aides » (planches 07 et 09) : règle ou masque qui
 * suit la ligne, un bloc à la fois, loupe sur les formules. Dans `App`, à côté du panneau. Rien n'est
 * rendu sans réglage (ni au pré-rendu : aucun réglage n'y est lu) ; les aides s'appliquent ensuite
 * d'elles-mêmes aux pages de lecture (cours, générateurs). « Plus d'air autour des signes »,
 * correspondances et exemples guidés sont du CSS (`lecture.css` § 6), sans code ici.
 */
export function HoteAidesLecture() {
  const r = useReglagesLecture()
  const actives = r.ligne !== 'aucune' || r.unbloc === 'oui' || r.loupe === 'oui'
  if (!actives || (typeof window !== 'undefined' && (window as { __prerendu?: boolean }).__prerendu)) return null
  return (
    <Suspense fallback={null}>
      <AidesLecture ligne={r.ligne} bande={r.bande} unbloc={r.unbloc === 'oui'} loupe={r.loupe === 'oui'} />
    </Suspense>
  )
}
