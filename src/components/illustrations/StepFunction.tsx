import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'stepFunction' }>, 'caption'>

const W = 460
const H = 260
const LEFT = 50
const RIGHT = 430
const TOP = 26
const BOTTOM = 200

/** Fonction de répartition d'une variable discrète, en escaliers — jamais une courbe. */
export function StepFunction({ jumps, levels, levelLabels, xMin, xMax, yMax = 1, xAxisLabel, yAxisLabel }: Props) {
  const mapX = (x: number) => LEFT + ((x - xMin) / (xMax - xMin)) * (RIGHT - LEFT)
  const mapY = (v: number) => BOTTOM - (v / yMax) * (BOTTOM - TOP)

  const bounds = [xMin, ...jumps, xMax]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Fonction de répartition, graphique en escaliers">
      <line x1={LEFT} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} className="svg-line" strokeWidth="1.5" />
      <line x1={LEFT} y1={TOP} x2={LEFT} y2={BOTTOM} className="svg-line" strokeWidth="1.5" />

      {levels.map((level, i) => (
        <line
          key={`seg-${i}`}
          x1={mapX(bounds[i])}
          y1={mapY(level)}
          x2={mapX(bounds[i + 1])}
          y2={mapY(level)}
          className="svg-accent"
          strokeWidth="2.4"
        />
      ))}

      {jumps.map((x, i) => (
        <line
          key={`jump-${i}`}
          x1={mapX(x)}
          y1={mapY(levels[i])}
          x2={mapX(x)}
          y2={mapY(levels[i + 1])}
          className="svg-faint"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
      ))}

      {jumps.map((x, i) => (
        <g key={`tick-${i}`}>
          <line x1={mapX(x)} y1={BOTTOM - 3} x2={mapX(x)} y2={BOTTOM + 3} className="svg-line" strokeWidth="1.2" />
          <text x={mapX(x)} y={BOTTOM + 18} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
            {x}
          </text>
        </g>
      ))}

      {levelLabels?.map((label, i) => {
        if (!label) return null
        const from = bounds[i + 1]
        const to = bounds[i + 2] ?? xMax
        const midX = mapX((from + to) / 2)
        return (
          <text key={`lvl-${i}`} x={midX} y={mapY(levels[i + 1]) - 8} textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight={700}>
            {label}
          </text>
        )
      })}

      <text x="10" y={TOP - 8} className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {yAxisLabel}
      </text>
      <text x={(LEFT + RIGHT) / 2} y={H - 8} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {xAxisLabel}
      </text>
    </svg>
  )
}
