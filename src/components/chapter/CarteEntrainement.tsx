import type { Block } from '../../content/types'
import { generatorLink } from '../../lib/generatorLink'

/** Bloc "S'entraîner" en fin de section : renvoie vers le générateur d'exercices correspondant. */
export function CarteEntrainement({ block }: { block: Extract<Block, { kind: 'entrainement' }> }) {
  const href = generatorLink(block.chantier, block.generatorId)
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
        <div className="generator-desc">
          {block.description.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <p className="generator-where">Plateforme → {block.whereLabel}</p>
          <a className="generator-cta" href={href} target="_blank" rel="noopener noreferrer">
            S'entraîner : {block.title} <span className="arrow">↗</span>
          </a>
        </div>
      </div>
    </div>
  )
}
