import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ChapterSection } from '../../content/types'
import { estGenerateurMigre, generatorLink } from '../../lib/generatorLink'
import { titreCourt } from '../../lib/parcoursChapitre'
import { EVENEMENT_SUIVI, lireEssais } from '../../lib/suiviEssais'
import { LIBELLE_ETAT_GENERATEUR, etatGenerateur } from '../../lib/guideEleve'
import { PastillesCompetences } from '../PastillesCompetences'
import { LienVue, type Aller } from './CarteChapitre'
import '../eleve/guideEleve.css'

type CarteEntrainement = Extract<ChapterSection['blocks'][number], { kind: 'entrainement' }>

/** Lien vers un générateur : route interne s'il est migré, sinon nouvel onglet (même règle que la carte « S'entraîner »). */
function LienGenerateur({ carte, className, children }: { carte: CarteEntrainement; className: string; children: React.ReactNode }) {
  const lien = generatorLink(carte.chantier, carte.generatorId)
  if (!lien) return null
  return estGenerateurMigre(carte.chantier, carte.generatorId) ? (
    <Link className={className} to={lien}>
      {children}
    </Link>
  ) : (
    <a className={className} href={lien} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  )
}

/**
 * Fin d'un point du chapitre (maquette « fin-etape » du 27/11/2026 ; vocabulaire « point » décidé le 28/11/2026) :
 * « Tu as fini le point n », puis :
 * - UN générateur dans le point → gros bouton « M'entraîner sur ce point » (même lien que la carte) ;
 * - PLUSIEURS générateurs → « M'entraîner sur ce point : choisis un exercice » et un bouton par générateur (code, titre,
 *   compétence, état « à revoir / nouveau / réussi » lu dans Ma progression, sur l'appareil) — jamais seulement le premier ;
 * puis « Point suivant : titre › » (« Réviser le chapitre » après le dernier) et « ou revenir à la liste des points ».
 * Rendue seulement pour le point AFFICHÉ (donc jamais au pré-rendu ni à l'impression : `no-export`).
 */
export function FinEtape({ section, suivante, aller }: { section: ChapterSection; suivante?: ChapterSection; aller: Aller }) {
  const cartes = section.blocks.filter((b): b is CarteEntrainement => b.kind === 'entrainement').filter((c, i, t) => t.findIndex((x) => x.generatorId === c.generatorId) === i)
  const [essais, setEssais] = useState(lireEssais)
  useEffect(() => {
    const relire = () => setEssais(lireEssais())
    window.addEventListener(EVENEMENT_SUIVI, relire)
    window.addEventListener('storage', relire)
    return () => {
      window.removeEventListener(EVENEMENT_SUIVI, relire)
      window.removeEventListener('storage', relire)
    }
  }, [])
  const titreSuivante = suivante ? `Point suivant : ${titreCourt(suivante)}` : 'Réviser le chapitre'
  const plusieurs = cartes.length > 1
  return (
    <aside className="ge-fin-etape no-export" aria-labelledby={`fin-${section.id}`}>
      <div className="ge-fin-bravo">
        <h3 id={`fin-${section.id}`}>
          Tu as fini le point {section.number} <span aria-hidden="true">🎉</span>
        </h3>
        <p>
          {cartes.length === 0
            ? 'Si tout est clair, touche « J’ai compris », puis passe à la suite.'
            : plusieurs
              ? `Pour le retenir, fais 2 ou 3 exercices maintenant. Ce point en propose ${cartes.length} : choisis.`
              : 'Pour le retenir, fais 2 ou 3 exercices maintenant.'}
        </p>
      </div>
      {cartes.length === 1 && (
        <LienGenerateur carte={cartes[0]} className="ge-bouton-plein">
          M’entraîner sur ce point
        </LienGenerateur>
      )}
      {plusieurs && (
        <div className="ge-fin-choix" role="group" aria-labelledby={`fin-choix-${section.id}`}>
          <p className="ge-fin-choix-titre" id={`fin-choix-${section.id}`}>
            M’entraîner sur ce point : choisis un exercice
          </p>
          <ul>
            {cartes.map((c) => {
              const etat = etatGenerateur(essais[c.generatorId])
              return (
                <li key={c.generatorId}>
                  <LienGenerateur carte={c} className="ge-fin-choix-lien">
                    <span className="ge-fin-choix-texte">
                      <span className="ge-fin-choix-nom">{c.title}</span>
                      <span className="ge-fin-choix-meta">
                        <code>{c.generatorId}</code>
                        <PastillesCompetences generatorId={c.generatorId} titre={c.title} />
                        <span className={`ge-etat ge-etat-${etat}`}>{LIBELLE_ETAT_GENERATEUR[etat]}</span>
                      </span>
                    </span>
                    <span aria-hidden="true" className="ge-fin-choix-fleche">
                      ›
                    </span>
                  </LienGenerateur>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <LienVue cible={suivante ? suivante.id : 'reviser'} aller={aller} className={cartes.length ? 'ge-bouton-contour' : 'ge-bouton-plein'}>
        {titreSuivante} ›
      </LienVue>
      <p className="ge-fin-liste">
        ou{' '}
        <LienVue cible={null} aller={aller}>
          revenir à la liste des points
        </LienVue>
      </p>
    </aside>
  )
}
