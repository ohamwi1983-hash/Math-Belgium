import { Link } from 'react-router-dom'
import type { Block } from '../../content/types'
import { estGenerateurMigre, generatorLink } from '../../lib/generatorLink'
import { InteractiveWidget } from './InteractiveWidget'

/**
 * Bloc "S'entraîner" en fin de section : renvoie vers le générateur d'exercices correspondant.
 * Quand `widgetTag` est fourni (gen7/gen8 seulement), le widget porté est monté directement
 * au-dessus de la description — le lien vers la version hébergée sur plateforme-maths reste
 * toujours affiché en dessous, c'est la version de référence maintenue.
 *
 * Un générateur déjà rapatrié (voir `estGenerateurMigre`) navigue dans l'onglet courant (`Link`
 * React Router, même principe qu'un lien de chapitre à chapitre) plutôt que d'ouvrir un nouvel
 * onglet vers plateforme-maths — c'est tout l'intérêt de la fusion en cours.
 */
export function CarteEntrainement({ block }: { block: Extract<Block, { kind: 'entrainement' }> }) {
  const href = generatorLink(block.chantier, block.generatorId)
  const migre = estGenerateurMigre(block.chantier, block.generatorId)
  return (
    <div className="generator-card no-export">
      <div className="generator-head">
        <div>
          <p className="eyebrow2">S'entraîner</p>
          <h4>{block.title}</h4>
        </div>
        <span className="generator-id">{block.generatorId}</span>
      </div>
      <div className="generator-body">
        {block.widgetTag && <InteractiveWidget tag={block.widgetTag} />}
        <div className="generator-desc">
          {block.description.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <p className="generator-where">Plateforme → {block.whereLabel}</p>
          {migre ? (
            <Link className="generator-cta" to={href}>
              S'entraîner : {block.title}
            </Link>
          ) : (
            <a className="generator-cta" href={href} target="_blank" rel="noopener noreferrer">
              S'entraîner : {block.title} <span className="arrow">↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
