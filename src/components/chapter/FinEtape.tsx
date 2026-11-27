import { Link } from 'react-router-dom'
import type { ChapterSection } from '../../content/types'
import { estGenerateurMigre, generatorLink } from '../../lib/generatorLink'
import { titreCourt } from '../../lib/parcoursChapitre'
import { LienVue, type Aller } from './CarteChapitre'
import '../eleve/guideEleve.css'

/**
 * Fin d'étape (maquette « fin-etape » du 27/11/2026) : « Tu as fini l'étape n » puis deux gros boutons —
 * « M'entraîner sur cette étape » (premier générateur des cartes « S'entraîner » de l'étape, même lien que
 * la carte) et « Étape suivante : titre › » (« Réviser le chapitre » après la dernière) — et « ou revenir à
 * la liste des étapes ». Rendue seulement pour l'étape AFFICHÉE (donc jamais au pré-rendu ni à
 * l'impression : `no-export`), sous le corps de l'étape, au-dessus de la barre « J'ai compris ».
 */
export function FinEtape({ section, suivante, aller }: { section: ChapterSection; suivante?: ChapterSection; aller: Aller }) {
  const carte = section.blocks.find((b): b is Extract<ChapterSection['blocks'][number], { kind: 'entrainement' }> => b.kind === 'entrainement')
  const lien = carte ? generatorLink(carte.chantier, carte.generatorId) : null
  const titreSuivante = suivante ? `Étape suivante : ${titreCourt(suivante)}` : 'Réviser le chapitre'
  return (
    <aside className="ge-fin-etape no-export" aria-labelledby={`fin-${section.id}`}>
      <div className="ge-fin-bravo">
        <h3 id={`fin-${section.id}`}>
          Tu as fini l’étape {section.number} <span aria-hidden="true">🎉</span>
        </h3>
        <p>{carte ? 'Pour la retenir, fais 2 ou 3 exercices maintenant.' : 'Si tout est clair, touche « J’ai compris », puis passe à la suite.'}</p>
      </div>
      {carte && lien &&
        (estGenerateurMigre(carte.chantier, carte.generatorId) ? (
          <Link className="ge-bouton-plein" to={lien}>
            M’entraîner sur cette étape
          </Link>
        ) : (
          <a className="ge-bouton-plein" href={lien} target="_blank" rel="noopener noreferrer">
            M’entraîner sur cette étape<span className="sr-only"> (nouvel onglet)</span>
          </a>
        ))}
      <LienVue cible={suivante ? suivante.id : 'reviser'} aller={aller} className={carte ? 'ge-bouton-contour' : 'ge-bouton-plein'}>
        {titreSuivante} ›
      </LienVue>
      <p className="ge-fin-liste">
        ou{' '}
        <LienVue cible={null} aller={aller}>
          revenir à la liste des étapes
        </LienVue>
      </p>
    </aside>
  )
}
