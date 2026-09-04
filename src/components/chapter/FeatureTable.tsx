import type { Block } from '../../content/types'
import { RichText } from '../Math'

/** Tableau à en-tête fixe (ex. "Fonction | Domaine | Image | Dérivée") — colonnes nommées, lignes
 * de données, à ne pas confondre avec `SignTable` (bornes/intervalles alignés). */
export function FeatureTable({ block }: { block: Extract<Block, { kind: 'featureTable' }> }) {
  return (
    <div className="table-scroll">
      <table className="tableau feature-table">
        {block.caption && <caption>{block.caption}</caption>}
        <thead>
          <tr>
            {block.headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => {
                const isToned = typeof cell === 'object'
                const text = isToned ? cell.text : cell
                const className = isToned ? (cell.tone === 'good' ? 'signe-pos' : 'signe-neg') : undefined
                return (
                  <td key={j} className={className}>
                    <RichText text={text} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
