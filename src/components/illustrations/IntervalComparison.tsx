import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'intervalComparison' }>, 'caption'>

const W = 460
const LEFT = 50
const RIGHT = 430
const ROW_H = 100
const PILL_H = 16

const FILL: Record<'accent' | 'good', string> = { accent: 'var(--accent)', good: 'var(--good)' }
const TEXT_CLASS: Record<'accent' | 'good', string> = { accent: 'svg-accent', good: 'svg-good' }

/** Compare des paires d'intervalles sur une même ligne graduée — chevauchement ou vraie partition. */
export function IntervalComparison({ min, max, ticks, rows }: Props) {
  const mapX = (x: number) => LEFT + ((x - min) / (max - min)) * (RIGHT - LEFT)
  const H = rows.length * ROW_H + 20

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Comparaison de 2 intervalles sur une ligne graduée">
      {rows.map((row, r) => {
        const lineY = 55 + r * ROW_H
        const pillY = lineY - 34
        return (
          <g key={r}>
            <line x1={LEFT} y1={lineY} x2={RIGHT} y2={lineY} className="svg-line" strokeWidth="1.5" />
            {ticks.map((t) => (
              <g key={t}>
                <line x1={mapX(t)} y1={lineY - 4} x2={mapX(t)} y2={lineY + 4} className="svg-line" strokeWidth="1.2" />
                <text x={mapX(t)} y={lineY + 20} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
                  {t}
                </text>
              </g>
            ))}
            {row.ranges.map((range, i) => {
              const from = range.from === 'min' ? min - 0.35 : range.from
              const to = range.to === 'max' ? max + 0.35 : range.to
              const x1 = mapX(from)
              const x2 = mapX(to)
              return (
                <g key={i}>
                  <rect x={x1} y={pillY} width={x2 - x1} height={PILL_H} rx={PILL_H / 2} fill={FILL[range.tone]} opacity={0.7} />
                  <text x={(x1 + x2) / 2} y={pillY - 8} textAnchor="middle" className={TEXT_CLASS[range.tone]} fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight={700}>
                    {range.label}
                  </text>
                </g>
              )
            })}
            {row.overlapAt !== undefined && (
              <circle cx={mapX(row.overlapAt)} cy={lineY} r="6" fill="var(--good)" className="svg-accent-outline" strokeWidth="2" />
            )}
          </g>
        )
      })}
    </svg>
  )
}
