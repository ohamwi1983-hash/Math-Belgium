import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'outcomeGrid' }>, 'caption'>

const L = 320
const H = 320
const PAD = 36

/** Grille des issues d'une expérience à 2 tirages numériques indépendants — quadrillage entier
 * 1..xMax × 1..yMax, un point par issue équiprobable, certains mis en évidence. */
export function OutcomeGrid({ xMax, yMax, xAxisLabel, yAxisLabel, highlighted }: Props) {
  const cellW = (L - PAD) / xMax
  const cellH = (H - PAD) / yMax
  const xScale = (x: number) => PAD + (x - 0.5) * cellW
  const yScale = (y: number) => H - (y - 0.5) * cellH

  const isHighlighted = (x: number, y: number) => highlighted.some((p) => p.x === x && p.y === y)

  const xs = Array.from({ length: xMax }, (_, i) => i + 1)
  const ys = Array.from({ length: yMax }, (_, i) => i + 1)

  return (
    <svg viewBox={`0 0 ${L + 20} ${H + 20}`} role="img" aria-label="Grille des issues">
      {xs.map((x) => (
        <line key={`vx${x}`} x1={PAD + x * cellW} y1={0} x2={PAD + x * cellW} y2={H} className="svg-faint" strokeWidth="1" />
      ))}
      {ys.map((y) => (
        <line key={`vy${y}`} x1={PAD} y1={H - y * cellH} x2={L} y2={H - y * cellH} className="svg-faint" strokeWidth="1" />
      ))}
      <line x1={PAD} y1={H} x2={L} y2={H} className="svg-line" strokeWidth="1.5" />
      <line x1={PAD} y1={0} x2={PAD} y2={H} className="svg-line" strokeWidth="1.5" />

      {xs.map((x) => (
        <text key={`xt${x}`} x={xScale(x)} y={H + 16} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11.5">
          {x}
        </text>
      ))}
      {ys.map((y) => (
        <text key={`yt${y}`} x={PAD - 10} y={yScale(y) + 4} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11.5">
          {y}
        </text>
      ))}

      {xs.flatMap((x) =>
        ys.map((y) => <circle key={`${x}-${y}`} cx={xScale(x)} cy={yScale(y)} r={isHighlighted(x, y) ? 5 : 2.6} className={isHighlighted(x, y) ? 'svg-accent' : 'svg-ink-faint'} />),
      )}

      <text x={L + 10} y={H + 4} textAnchor="end" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
        {xAxisLabel}
      </text>
      <text x={PAD - 30} y={10} className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
        {yAxisLabel}
      </text>
    </svg>
  )
}
