import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'frequencyStabilization' }>, 'caption'>

const W = 540
const H = 240
const LEFT = 58
const RIGHT = 470
const TOP = 20
const BOTTOM = 196

/**
 * Stabilisation d'une fréquence relative au fil des répétitions : ligne brisée des relevés,
 * valeur limite en pointillés. Les relevés sont des mesures expérimentales — aucun n'est
 * recalculé ni interpolé par le composant, seul le tracé qui les relie est visuel.
 */
export function FrequencyStabilization({ frequencies, step, target, yMin, yMax, xTicks, xAxisLabel, yAxisLabel }: Props) {
  const nMax = frequencies.length * step
  const span = yMax - yMin || 1

  const px = (n: number) => LEFT + (n / nMax) * (RIGHT - LEFT)
  const py = (f: number) => BOTTOM - ((f - yMin) / span) * (BOTTOM - TOP)

  const points = frequencies.map((f, i) => ({ x: px((i + 1) * step), y: py(f) }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const targetY = py(target.value)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Fréquence relevée au fil des répétitions : elle se stabilise autour de ${target.label}`}>
      <line x1={LEFT} y1={BOTTOM} x2={RIGHT + 6} y2={BOTTOM} className="svg-line" strokeWidth="1.5" />
      <line x1={LEFT} y1={BOTTOM} x2={LEFT} y2={TOP} className="svg-line" strokeWidth="1.5" />

      <line x1={LEFT} y1={targetY} x2={RIGHT} y2={targetY} className="svg-good" strokeWidth="1.4" strokeDasharray="4 3" />
      <text x={RIGHT + 8} y={targetY + 4} className="svg-good" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {target.label}
      </text>

      <path d={path} fill="none" className="svg-accent-outline" strokeWidth="1.8" />
      {points.map((p, i) =>
        i % 3 === 0 || i === points.length - 1 ? <circle key={i} cx={p.x} cy={p.y} r="2.6" className="svg-accent" stroke="none" /> : null,
      )}

      {xTicks?.map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={BOTTOM} x2={px(t)} y2={BOTTOM + 4} className="svg-line" strokeWidth="1" />
          <text x={px(t)} y={BOTTOM + 17} textAnchor="middle" className="svg-ink" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="11">
            {t}
          </text>
        </g>
      ))}

      <text x={(LEFT + RIGHT) / 2} y={H - 8} textAnchor="middle" className="svg-ink-faint" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {xAxisLabel}
      </text>
      <text x="8" y={TOP - 6} className="svg-ink-faint" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {yAxisLabel}
      </text>
    </svg>
  )
}
