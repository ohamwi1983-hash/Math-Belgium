import type { Block } from '../../content/types'
import { RichText } from '../Math'

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
