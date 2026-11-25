import { lazy, Suspense } from 'react'
import { estReglageDuSite, useReglagesLecture } from '../../lib/reglagesLecture'
import { ouvrirPanneauLecture, usePanneauLectureOuvert } from './etatPanneauLecture'

/** Code du panneau chargé à la PREMIÈRE ouverture seulement (aucun poids pour qui ne s'en sert pas). */
const PanneauLecture = lazy(() => import('./PanneauLecture'))

/**
 * Bouton « Aa » du confort de lecture (maquettes planches 01–02) :
 * - `entete` : en-tête du site (toutes les pages à `SiteHeader`) — « Aa », et « Aa Lecture » dès 900 px ;
 *   masqué sur téléphone dans une étape de chapitre (il y est dans la barre collante) ;
 * - `etape` : barre collante de l'étape (téléphone, tablette), toujours sous le pouce ;
 * - `outil` : outils du chapitre (« Lecture », à côté de « Feuilles » et « Imprimer »).
 * Pastille orange quand un réglage personnel est actif (CSS `:root[data-lecture-perso]`, posé avant
 * l'affichage : rien ne clignote).
 */
export function BoutonLecture({ variante }: { variante: 'entete' | 'etape' | 'outil' }) {
  const ouvert = usePanneauLectureOuvert()
  const perso = !estReglageDuSite(useReglagesLecture())
  const nom = `Confort de lecture : taille, police, couleurs${perso ? ' (réglage personnel actif)' : ''}`
  if (variante === 'outil') {
    return (
      <button
        type="button"
        className={`lecture-outil${ouvert ? ' actif' : ''}`}
        title="Confort de lecture"
        aria-label={nom}
        aria-haspopup="dialog"
        aria-expanded={ouvert}
        data-bouton-lecture=""
        onClick={(e) => ouvrirPanneauLecture(e.currentTarget)}
      >
        <span className="aa-outil" aria-hidden="true">
          A<small>a</small>
        </span>
        <span aria-hidden="true">Lecture</span>
        <span className="pastille-reglee" aria-hidden="true" />
      </button>
    )
  }
  return (
    <button
      type="button"
      className="btn-lecture"
      aria-label={nom}
      aria-haspopup="dialog"
      aria-expanded={ouvert}
      data-bouton-lecture=""
      onClick={(e) => ouvrirPanneauLecture(e.currentTarget)}
    >
      <span className="aa" aria-hidden="true">
        A<small>a</small>
      </span>
      {variante === 'entete' && (
        <span className="btn-lecture-mot" aria-hidden="true">
          Lecture
        </span>
      )}
      <span className="pastille-reglee" aria-hidden="true" />
    </button>
  )
}

/** Hôte unique du panneau (dans `App`, autour des routes) : rendu seulement quand il est ouvert. */
export function HotePanneauLecture() {
  const ouvert = usePanneauLectureOuvert()
  if (!ouvert) return null
  return (
    <Suspense fallback={null}>
      <PanneauLecture />
    </Suspense>
  )
}
