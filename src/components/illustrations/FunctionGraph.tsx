import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'functionGraph' }>, 'caption'>

const X_LEFT = 70
const X_RIGHT = 610
const Y_BOTTOM = 250
const Y_TOP = 20
const SAMPLES = 80

/** Trace la courbe réelle de `fn` sur [xMin, xMax], avec un point marqué. */
export function FunctionGraph({ fn, xMin, xMax, xTicks, markX, markLabel, xAxisLabel, yAxisLabel }: Props) {
  const xs = Array.from({ length: SAMPLES + 1 }, (_, i) => xMin + ((xMax - xMin) * i) / SAMPLES)
  const ys = xs.map(fn)
  const yMax = Math.max(...ys, fn(markX))

  const xScale = (v: number) => X_LEFT + ((v - xMin) / (xMax - xMin)) * (X_RIGHT - X_LEFT)
  const yScale = (v: number) => Y_BOTTOM - (v / yMax) * (Y_BOTTOM - Y_TOP)

  const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${xScale(x).toFixed(2)},${yScale(ys[i]).toFixed(2)}`).join(' ')

  const markPixelX = xScale(markX)
  const markPixelY = yScale(fn(markX))

  return (
    <svg viewBox="0 0 640 290" role="img" aria-label={`Graphe de la fonction, courbe avec le point marqué ${markLabel}`}>
      <line x1={X_LEFT} y1={Y_BOTTOM} x2={X_LEFT} y2={Y_TOP} className="svg-line" strokeWidth="1.5" markerEnd="url(#fg-arrow)" />
      <line x1={X_LEFT} y1={Y_BOTTOM} x2={X_RIGHT} y2={Y_BOTTOM} className="svg-line" strokeWidth="1.5" markerEnd="url(#fg-arrow)" />
      <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11">
        {xTicks.map((t) => (
          <text key={t} x={xScale(t)} y={Y_BOTTOM + 15} textAnchor="middle">{t}</text>
        ))}
        <text x={X_LEFT - 15} y={Y_BOTTOM + 4} textAnchor="end">0</text>
      </g>
      <text x={X_RIGHT} y={Y_BOTTOM - 5} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">{xAxisLabel}</text>
      <text x={X_LEFT + 8} y={Y_TOP + 10} className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">{yAxisLabel}</text>

      <path d={pathD} fill="none" className="svg-line" strokeWidth="2.5" strokeLinejoin="round" />

      <line x1={markPixelX} y1={Y_BOTTOM} x2={markPixelX} y2={markPixelY} className="svg-accent" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={markPixelX} cy={markPixelY} r="4.5" className="svg-accent" />
      <line x1={markPixelX} y1={markPixelY} x2={X_LEFT} y2={markPixelY} className="svg-accent" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x={markPixelX} y={Y_BOTTOM + 20} textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600">
        r={markX}
      </text>
      <text x={X_LEFT - 10} y={markPixelY + 4} textAnchor="end" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600">
        {markLabel}
      </text>

      <defs>
        <marker id="fg-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  )
}
