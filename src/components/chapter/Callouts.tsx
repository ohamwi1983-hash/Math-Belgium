import type { Block } from '../../content/types'
import { RichText } from '../Math'
import { Illustration } from '../illustrations/Illustration'

/** Callout "Rappel" — neutre, liste à puces de rappels de théorie. */
export function Rappel({ block }: { block: Extract<Block, { kind: 'rappel' }> }) {
  return (
    <div className="callout callout-rappel">
      <p className="callout-label">{block.label ?? 'Rappel'}</p>
      <ul className="plain" style={{ marginBottom: 0 }}>
        {block.items.map((item, i) => (
          <li key={i}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Callout "Méthode" — étapes numérotées à suivre. */
export function Methode({ block }: { block: Extract<Block, { kind: 'methode' }> }) {
  return (
    <div className="callout callout-methode">
      <p className="callout-label">{block.label ?? 'Méthode'}</p>
      <ol>
        {block.items.map((item, i) => (
          <li key={i}>
            <RichText text={item} />
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Callout "⚠ Attention" — piège fin ou nuance à ne pas manquer. */
export function Attention({ block }: { block: Extract<Block, { kind: 'attention' }> }) {
  return (
    <div className="callout callout-attention">
      <p className="callout-label">
        <span className="icon">⚠</span> {block.label ?? 'Attention'}
      </p>
      <p>
        <RichText text={block.text} />
      </p>
      {block.items && (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Callout "💡 Astuce" — conseil pratique, avec liste optionnelle. */
export function Astuce({ block }: { block: Extract<Block, { kind: 'astuce' }> }) {
  return (
    <div className="callout callout-astuce">
      <p className="callout-label">
        <span className="icon">💡</span> {block.label ?? 'Astuce'}
      </p>
      <p>
        <RichText text={block.text} />
      </p>
      {block.items && (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Callout "Piège classique" — erreur fréquente à anticiper. */
export function PiegeClassique({ block }: { block: Extract<Block, { kind: 'piege' }> }) {
  return (
    <div className="callout callout-piege">
      <p className="callout-label">{block.label ?? 'Piège classique'}</p>
      <p>
        <RichText text={block.text} />
      </p>
    </div>
  )
}

/** Callout "intuition" — image concrète, analogie ou "pourquoi" avant/à côté de la règle formelle. */
export function Intuition({ block }: { block: Extract<Block, { kind: 'intuition' }> }) {
  return (
    <div className="callout callout-intuition">
      <p className="callout-label">{block.label ?? 'Intuition'}</p>
      <p>
        <RichText text={block.text} />
      </p>
    </div>
  )
}

/** Encart historique "Le sais-tu ?" — portrait/document d'époque optionnel à côté du texte.
 * `image` exclu de l'export HTML (`no-export`) : le pipeline d'export clone le DOM/CSS tel quel
 * (voir `.claude/rules/export-pipeline.md`) et ne sait pas encore inliner une image bitmap en
 * `data:` URI comme il le fait déjà pour les polices — le texte (titre + anecdote) reste exporté,
 * seule l'image est omise plutôt que de casser le fichier HTML autonome une fois ouvert hors ligne. */
export function Historique({ block }: { block: Extract<Block, { kind: 'historique' }> }) {
  return (
    <div className="historique-scroll">
      <div className="dowel" aria-hidden="true" />
      <div className="sheet">
        <p className="callout-label">
          <span className="icon" aria-hidden="true">
            📜
          </span>{' '}
          Le sais-tu ?
        </p>
        <div className="historique-body">
          {block.image && (
            <figure className="historique-figure no-export">
              <img src={block.image.src} alt={block.image.alt} loading="lazy" />
              <figcaption>{block.image.caption}</figcaption>
            </figure>
          )}
          <div className="historique-text">
            <p className="historique-titre">{block.titre}</p>
            <p>
              <RichText text={block.text} />
            </p>
          </div>
        </div>
      </div>
      <div className="dowel" aria-hidden="true" />
    </div>
  )
}

/** Encart "À quoi ça sert ?" — application concrète hors maths pure, teinte bleue (`--sky`) pour
 * se distinguer à la fois des autres callouts et de `Historique` (sépia). Bandeau de titre plein
 * (pas juste une bordure gauche) pour se détacher nettement des autres callouts, une fois choisi
 * entre plusieurs propositions soumises à l'utilisateur. `domaines` est rendu en texte BRUT (comme
 * `label`/`badge` ailleurs), jamais de RichText dedans. Même convention `no-export` que
 * `Historique` sur `image`. */
export function Application({ block }: { block: Extract<Block, { kind: 'application' }> }) {
  return (
    <div className="callout callout-application">
      <p className="callout-label">
        <span className="icon" aria-hidden="true">
          🌍
        </span>{' '}
        À quoi ça sert ?
      </p>
      <div className="application-content">
        <div className="application-body">
          {block.image && (
            <figure className="application-figure no-export">
              <img src={block.image.src} alt={block.image.alt} loading="lazy" />
              <figcaption>{block.image.caption}</figcaption>
            </figure>
          )}
          <div className="application-text">
            <p className="application-titre">{block.titre}</p>
            <p>
              <RichText text={block.text} />
            </p>
            <ul className="application-domaines">
              {block.domaines.map((domaine, i) => (
                <li key={i}>{domaine}</li>
              ))}
            </ul>
          </div>
        </div>
        {block.illustrations && block.illustrations.length > 0 && (
          <div className="application-diagrams no-export">
            {block.illustrations.map((spec, i) => (
              <Illustration key={i} spec={spec} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Callout "Définitions" — paragraphes de définition formelle (pas une liste à puces, contrairement
 * à `Rappel`). */
export function Definition({ block }: { block: Extract<Block, { kind: 'definition' }> }) {
  return (
    <div className="callout callout-definition">
      <p className="callout-label">{block.label ?? 'Définitions'}</p>
      {block.items.map((item, i) => (
        <p key={i}>
          <RichText text={item} />
        </p>
      ))}
    </div>
  )
}
