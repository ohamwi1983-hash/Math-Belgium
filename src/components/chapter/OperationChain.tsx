import type { Block } from '../../content/types'
import { RichText } from '../Math'

/** Chaîne de valeurs reliées par des opérations nommées sur les flèches. HTML/flexbox — les
 * nœuds contiennent du texte riche (KaTeX), donc pas un diagramme SVG. */
export function OperationChain({ block }: { block: Extract<Block, { kind: 'operationChain' }> }) {
  const arrow = block.direction === 'backward' ? '←' : '→'
  return (
    <div className="chain-row">
      {block.nodes.map((node, i) => (
        <span key={i} className="chain-row-item">
          <span className="chain-node">
            <RichText text={node} />
          </span>
          {i < block.operations.length && (
            <span className="chain-op">
              <span className="chain-op-label">{block.operations[i]}</span>
              <span className="chain-arrow" aria-hidden="true">
                {arrow}
              </span>
            </span>
          )}
        </span>
      ))}
    </div>
  )
}
