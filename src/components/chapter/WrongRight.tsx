import type { Block } from '../../content/types'
import { RichText } from '../Math'

/** Comparaison côte-à-côte "décomposition incomplète" vs "correcte" (ou équivalent). */
export function WrongRight({ block }: { block: Extract<Block, { kind: 'wrongRight' }> }) {
  return (
    <div className="wrong-right">
      <div className="wrong">
        <span className="tag">{block.wrongTag}</span>
        <RichText text={block.wrong} />
      </div>
      <div className="right">
        <span className="tag">{block.rightTag}</span>
        <RichText text={block.right} />
      </div>
    </div>
  )
}
