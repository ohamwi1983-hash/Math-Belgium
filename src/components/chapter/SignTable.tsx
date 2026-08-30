import type { Block } from '../../content/types'

const TONE_CLASS: Record<'zero' | 'pos' | 'neg' | 'plain', string | undefined> = {
  zero: 'zero-cell',
  pos: 'signe-pos',
  neg: 'signe-neg',
  plain: undefined,
}

/** Tableau de signes / de variation — lignes alignées colonne par colonne. */
export function SignTable({ block }: { block: Extract<Block, { kind: 'signTable' }> }) {
  return (
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
  )
}
