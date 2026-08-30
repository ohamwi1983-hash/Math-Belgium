import type { Block } from '../../content/types'
import { RichText } from '../Math'
import { Illustration } from '../illustrations/Illustration'

/** Bloc "Exemple résolu" : formule de départ, étapes tagguées, résultat encadré. */
export function ExempleResolu({ block }: { block: Extract<Block, { kind: 'exemple' }> }) {
  return (
    <div className="exemple">
      <div className="exemple-head">
        Exemple résolu
        {block.badge && <span className="badge">{block.badge}</span>}
      </div>
      <div className="exemple-body">
        {block.formula && (
          <p className="formula">
            <RichText text={block.formula} />
          </p>
        )}
        {block.steps.map((step, i) => (
          <div className="step" key={i}>
            <span className="tag">{step.tag}</span>
            <RichText text={step.text} />
          </div>
        ))}
        <div className={`exemple-result${block.result.isEmpty ? ' is-empty' : ''}`}>
          <span className="tag">{block.result.tag}</span>
          <RichText text={block.result.text} />
        </div>
        {block.illustration && <Illustration spec={block.illustration} />}
      </div>
    </div>
  )
}
