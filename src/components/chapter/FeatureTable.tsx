import type { Block } from '../../content/types'
import { RichText } from '../Math'
import { SansMotsDuCours } from '../motsDuCoursContexte'

/** Tableau à en-tête fixe (ex. "Fonction | Domaine | Image | Dérivée") — colonnes nommées, lignes
 * de données, à ne pas confondre avec `SignTable` (bornes/intervalles alignés).
 *
 * `synthese` (tableau de « Ce qu'il faut retenir », `RecapFinal`) : les en-têtes passent eux aussi
 * par `RichText` (décision de l'utilisateur : les synthèses sont en KaTeX, en-têtes compris) et le
 * tableau prend la police de lecture (classe `feature-table--synthese`) au lieu de la police
 * monospace des tableaux de signes. Les `featureTable` du corps du cours ne changent pas. */
export function FeatureTable({
  block,
  synthese = false,
}: {
  block: Extract<Block, { kind: 'featureTable' }>
  synthese?: boolean
}) {
  // Tableau : jamais de mot du cours souligné (cellules courtes, données).
  return (
    <SansMotsDuCours>
    <div className="table-scroll">
      <table className={synthese ? 'tableau feature-table feature-table--synthese' : 'tableau feature-table'}>
        {block.caption && <caption>{block.caption}</caption>}
        <thead>
          <tr>
            {block.headers.map((h, i) => (
              <th key={i}>{synthese ? <RichText text={h} /> : h}</th>
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
    </SansMotsDuCours>
  )
}
