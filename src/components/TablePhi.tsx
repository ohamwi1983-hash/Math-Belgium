import { COLONNES_TABLE_PHI, LIGNES_TABLE_PHI, caseDe, formatProba4, formatZ, valeurCase } from '../lib/tablePhi'
import './tablePhi.css'

/**
 * Table de la loi normale centrée réduite Φ(z) = P(Z ≤ z), affichée en entier (z de 0,00 à 3,49).
 * Composant PARTAGÉ (cours ET générateurs) : les valeurs viennent toutes de `lib/tablePhi.ts`, la
 * même source que `phiTable` / `lectureInverse` (vérification d'une lecture) et que l'annexe papier
 * (`tablePhiHtml`).
 *
 * Usage :
 * - cours : bloc `{ kind: 'tablePhi' }` (rendu par `BlockRenderer`) ;
 * - générateur : `<TablePhi />` dans un `<details>` « Consulter la table de Φ », ou toujours visible ;
 *   `surligner={1.23}` met en évidence la case, sa ligne et sa colonne (à n'utiliser QUE dans un
 *   corrigé ou une aide de niveau 2 : sinon la case trahit la réponse) ; `compact` resserre les cases.
 *
 * À 390 px, la table défile horizontalement dans son cadre, la colonne « z » restant visible
 * (`position: sticky`) ; la page elle-même ne défile jamais de côté.
 */
export function TablePhi({
  surligner,
  compact = false,
  legende = true,
  titre,
}: {
  surligner?: number
  compact?: boolean
  legende?: boolean
  titre?: string
}) {
  const cible = surligner === undefined ? null : caseDe(surligner)
  return (
    <div className={compact ? 'table-phi-cours table-phi-cours--compact' : 'table-phi-cours'}>
      {titre && <p className="table-phi-cours-titre">{titre}</p>}
      <div className="table-phi-cours-cadre" role="region" aria-label="Table de la loi normale centrée réduite" tabIndex={0}>
        <table>
          <caption className="table-phi-cours-caption">Φ(z) = P(Z ≤ z), Z ∼ 𝒩(0 ; 1)</caption>
          <thead>
            <tr>
              <th scope="col" className="table-phi-cours-coin">z</th>
              {COLONNES_TABLE_PHI.map((c, j) => (
                <th key={j} scope="col" className={cible && cible.colonne === j ? 'is-cible' : undefined}>
                  {formatZ(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIGNES_TABLE_PHI.map((l, i) => (
              <tr key={i} className={i % 5 === 4 ? 'table-phi-cours-filet' : undefined}>
                <th scope="row" className={cible && cible.ligne === i ? 'is-cible' : undefined}>
                  {l.toFixed(1).replace('.', ',')}
                </th>
                {COLONNES_TABLE_PHI.map((_, j) => {
                  const estCible = cible !== null && cible.ligne === i && cible.colonne === j
                  const surAxe = cible !== null && (cible.ligne === i || cible.colonne === j)
                  return (
                    <td key={j} className={estCible ? 'is-cible' : surAxe ? 'is-axe' : undefined}>
                      {formatProba4(valeurCase(i, j))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {legende && (
        <p className="table-phi-cours-legende">
          Ligne : unités et dixième de z · colonne : centième. Exemple : Φ(1,23) se lit ligne 1,2, colonne 0,03. Pour z &lt; 0 :
          Φ(−z) = 1 − Φ(z). Au-delà de 3,49 : Φ(z) ≈ 1.
        </p>
      )}
    </div>
  )
}
