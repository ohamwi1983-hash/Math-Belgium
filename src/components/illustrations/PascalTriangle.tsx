import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'pascalTriangle' }>, 'caption'>

const W = 460
const ROW_H = 40
const TOP = 30
const CENTER = 250
const SPACING = 56

/** Une ligne du triangle : C(n,0) … C(n,n), calculés de proche en proche. */
function pascalRows(rowCount: number): number[][] {
  const rows: number[][] = []
  for (let n = 0; n < rowCount; n++) {
    const prev = rows[n - 1]
    rows.push(Array.from({ length: n + 1 }, (_, k) => (n === 0 ? 1 : (prev[k - 1] ?? 0) + (prev[k] ?? 0))))
  }
  return rows
}

/** Triangle de Pascal — coefficients calculés, relation de Pascal mise en évidence si demandée. */
export function PascalTriangle({ rowCount, pascalRelation }: Props) {
  const rows = pascalRows(rowCount)
  const H = TOP + rowCount * ROW_H + 12

  const posOf = (row: number, index: number) => ({
    x: CENTER - ((rows[row].length - 1) * SPACING) / 2 + index * SPACING,
    y: TOP + row * ROW_H,
  })

  const rel = pascalRelation
  const parents = rel && rel.row > 0 ? [{ row: rel.row - 1, index: rel.index - 1 }, { row: rel.row - 1, index: rel.index }] : []
  const isParent = (row: number, index: number) => parents.some((p) => p.row === row && p.index === index)
  const isChild = (row: number, index: number) => !!rel && rel.row === row && rel.index === index

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Triangle de Pascal, lignes n=0 à ${rowCount - 1}`}>
      {rel &&
        parents.map((p, i) => {
          const a = posOf(p.row, p.index)
          const b = posOf(rel.row, rel.index)
          return <line key={`r${i}`} x1={a.x} y1={a.y + 7} x2={b.x} y2={b.y - 15} className="svg-faint" strokeWidth="1.2" strokeDasharray="4 3" />
        })}

      {rows.map((row, n) => (
        <g key={`row${n}`}>
          <text x="16" y={posOf(n, 0).y + 5} className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
            n={n}
          </text>
          {row.map((value, k) => {
            const p = posOf(n, k)
            const cls = isChild(n, k) ? 'svg-good' : isParent(n, k) ? 'svg-accent' : 'svg-ink'
            return (
              <text
                key={k}
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                className={cls}
                stroke="none"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="14"
                fontWeight={isChild(n, k) || isParent(n, k) ? 700 : 600}
              >
                {value}
              </text>
            )
          })}
        </g>
      ))}
    </svg>
  )
}
