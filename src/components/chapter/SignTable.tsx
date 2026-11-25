import { useMemo } from 'react'
import type { Block } from '../../content/types'
import { LectureTableau } from './LectureTableau'

const TONE_CLASS: Record<'zero' | 'pos' | 'neg' | 'plain' | 'indef', string | undefined> = {
  zero: 'zero-cell',
  pos: 'signe-pos',
  neg: 'signe-neg',
  plain: undefined,
  indef: 'indef-cell',
}

/** Tableau de signes / de variation — lignes alignées colonne par colonne. Le balisage du tableau
 * est inchangé ; `LectureTableau` l'enveloppe pour la lecture case par case (écran seulement). */
export function SignTable({ block }: { block: Extract<Block, { kind: 'signTable' }> }) {
  const modele = useMemo(
    () => ({ caption: block.caption, rows: block.rows.map((r) => ({ label: r.label, cells: r.cells.map((c) => c.text) })) }),
    [block],
  )
  return (
    <LectureTableau modele={modele}>
      <div className="table-scroll">
        <table className="tableau">
          <caption>{block.caption}</caption>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i}>
                <td className="axe-x">{row.label}</td>
                {row.cells.map((cell, j) => (
                  <td key={j} className={TONE_CLASS[cell.tone]}>
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LectureTableau>
  )
}
