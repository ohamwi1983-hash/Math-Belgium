import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'histogram' }>, 'caption'>

const X_LEFT = 55
const X_RIGHT = 440
const Y_TOP = 25
const Y_BOTTOM = 220

/** Histogramme — barres accolées pour des classes consécutives, hauteur = effectif. */
export function Histogram({ bars, xAxisLabel, yAxisLabel }: Props) {
  const xMin = bars[0]?.from ?? 0
  const xMax = bars.reduce((m, b) => Math.max(m, b.from + b.width), xMin)
  const yMax = Math.max(...bars.map((b) => b.height), 1)

  const xScale = (x: number) => X_LEFT + ((x - xMin) / (xMax - xMin || 1)) * (X_RIGHT - X_LEFT)
  const yScale = (y: number) => Y_BOTTOM - (y / (yMax * 1.15)) * (Y_BOTTOM - Y_TOP)

  const xTicks = [...new Set(bars.flatMap((b) => [b.from, b.from + b.width]))].sort((a, b) => a - b)
  const yTicks = [...new Set(bars.map((b) => b.height))].sort((a, b) => a - b)

  return (
    <svg viewBox="0 0 460 260" role="img" aria-label="Histogramme">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={X_LEFT - 5} y1={yScale(t)} x2={X_RIGHT} y2={yScale(t)} className="svg-faint" strokeWidth="1" strokeDasharray="3 3" />
          <text x={X_LEFT - 8} y={yScale(t) + 4} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11.5">
            {t}
          </text>
        </g>
      ))}

      {bars.map((b, i) => (
        <rect key={i} x={xScale(b.from)} y={yScale(b.height)} width={xScale(b.from + b.width) - xScale(b.from)} height={Y_BOTTOM - yScale(b.height)} className="svg-bar" />
      ))}

      <line x1={X_LEFT} y1={Y_BOTTOM} x2={X_RIGHT} y2={Y_BOTTOM} className="svg-line" strokeWidth="1.5" />
      <line x1={X_LEFT} y1={Y_BOTTOM} x2={X_LEFT} y2={Y_TOP} className="svg-line" strokeWidth="1.5" />
      {xTicks.map((t) => (
        <text key={t} x={xScale(t)} y={Y_BOTTOM + 15} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11.5">
          {t}
        </text>
      ))}
      <text x={X_RIGHT + 6} y={Y_BOTTOM + 6} className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
        {xAxisLabel}
      </text>
      <text x={X_LEFT - 20} y={Y_TOP - 8} className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
        {yAxisLabel}
      </text>
    </svg>
  )
}
