import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ChapterContent } from '../../content/types'
import { imprimerChapitre, imprimerFormulaireSeul } from '../../lib/imprimer'

/**
 * Ligne « CE CHAPITRE » du sommaire (ordinateur) et du tiroir « Sections » (téléphone), avec deux
 * outils à droite, au-dessus des onglets — variante C validée par l'utilisateur sur maquette
 * (icône + mot court) :
 * - « Feuilles » : page de conception des feuilles d'exercices et d'évaluation du chapitre
 *   (`/{levelSlug}/{slug}/exercices`) ;
 * - « Imprimer » : petit menu « Chapitre entier » / « Formulaire seul » (le second seulement si le
 *   chapitre a un formulaire ; sinon impression directe du chapitre).
 * `avantImpression` : ferme le tiroir du téléphone avant d'ouvrir la boîte d'impression.
 */
export function OutilsChapitre({ chapter, avantImpression }: { chapter: ChapterContent; avantImpression?: () => void }) {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const conteneurRef = useRef<HTMLDivElement>(null)
  const aUnFormulaire = !!chapter.formulaire

  useEffect(() => {
    if (!menuOuvert) return
    const fermerSiDehors = (e: MouseEvent) => {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) setMenuOuvert(false)
    }
    const fermerSurEchap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOuvert(false)
    }
    document.addEventListener('mousedown', fermerSiDehors)
    document.addEventListener('keydown', fermerSurEchap)
    return () => {
      document.removeEventListener('mousedown', fermerSiDehors)
      document.removeEventListener('keydown', fermerSurEchap)
    }
  }, [menuOuvert])

  function lancer(impression: () => void) {
    setMenuOuvert(false)
    avantImpression?.()
    // Laisse le tiroir se refermer (et le menu disparaître) avant la boîte d'impression.
    window.setTimeout(impression, 60)
  }

  return (
    <div className="lecture-entete">
      <p className="lecture-sheet-title">Ce chapitre</p>
      <div className="lecture-outils" ref={conteneurRef}>
        <Link className="lecture-outil" to={`/${chapter.levelSlug}/${chapter.slug}/exercices`} title="Feuilles d'exercices et évaluations du chapitre">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M16 3v4h4" />
            <path d="M9.5 11h7M9.5 14.5h7M9.5 18h4" />
            <path d="M6 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2" />
          </svg>
          <span>Feuilles</span>
        </Link>
        <button
          type="button"
          className={`lecture-outil${menuOuvert ? ' actif' : ''}`}
          title="Imprimer"
          aria-haspopup={aUnFormulaire ? 'menu' : undefined}
          aria-expanded={aUnFormulaire ? menuOuvert : undefined}
          onClick={() => (aUnFormulaire ? setMenuOuvert((o) => !o) : lancer(imprimerChapitre))}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 9V3h10v6" />
            <rect x="3" y="9" width="18" height="8" rx="2" />
            <path d="M7 14h10v7H7z" />
            <circle cx="17.5" cy="12" r="0.6" fill="currentColor" />
          </svg>
          <span>Imprimer</span>
        </button>
        {menuOuvert && (
          <div className="lecture-menu-impression" role="menu">
            <button type="button" role="menuitem" onClick={() => lancer(imprimerChapitre)}>
              Chapitre entier
            </button>
            <button type="button" role="menuitem" onClick={() => lancer(imprimerFormulaireSeul)}>
              Formulaire seul
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
