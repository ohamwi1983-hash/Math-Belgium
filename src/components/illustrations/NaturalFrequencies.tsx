import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'naturalFrequencies' }>, 'caption'>

type SegTone = 'accent' | 'accentFaint' | 'good' | 'goodFaint'

const SEG_FILL: Record<SegTone, string> = {
  accent: 'var(--accent)',
  accentFaint: 'var(--accent)',
  good: 'var(--good)',
  goodFaint: 'var(--good)',
}
const SEG_OPACITY: Record<SegTone, number> = { accent: 0.78, accentFaint: 0.2, good: 0.78, goodFaint: 0.22 }

const W = 460
const H = 262
const BAR_W = 62
const BAR_TOP = 54
const BAR_H = 170
const COLUMN_X = [26, 186, 356]

/**
 * Fréquences naturelles : des colonnes de MÊME hauteur, chacune redécoupée à sa propre échelle,
 * pour opposer visuellement deux conditionnements inverses (ici P(T⁺|malade) contre
 * P(malade|T⁺)). Les hauteurs des segments sont calculées à partir des effectifs fournis, jamais
 * saisies en pixels.
 */
export function NaturalFrequencies({ headline, columns }: Props) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={headline}>
      <text x={W / 2} y="20" textAnchor="middle" className="svg-ink" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700">
        {headline}
      </text>

      {columns.map((col, ci) => {
        const x = COLUMN_X[ci] ?? COLUMN_X[COLUMN_X.length - 1]
        const total = col.segments.reduce((s, seg) => s + seg.count, 0) || 1
        let cursor = BAR_TOP
        const placed = col.segments.map((seg) => {
          const h = (seg.count / total) * BAR_H
          const box = { ...seg, y: cursor, h }
          cursor += h
          return box
        })
        const labelX = col.labelSide === 'right' ? x + BAR_W + 7 : x - 7
        const anchor = col.labelSide === 'right' ? 'start' : 'end'

        return (
          <g key={ci}>
            {placed.map((seg, si) => (
              <rect key={si} x={x} y={seg.y} width={BAR_W} height={seg.h} fill={SEG_FILL[seg.tone]} opacity={SEG_OPACITY[seg.tone]} />
            ))}
            <rect x={x} y={BAR_TOP} width={BAR_W} height={BAR_H} fill="none" className="svg-line" strokeWidth="1.3" />
            {placed.slice(1).map((seg, si) => (
              <line key={si} x1={x} y1={seg.y} x2={x + BAR_W} y2={seg.y} className="svg-line" strokeWidth="1.3" />
            ))}

            {col.title && (
              <text
                x={x + BAR_W / 2}
                y={BAR_TOP - 10}
                textAnchor="middle"
                className={col.titleTone === 'accent' ? 'svg-accent' : 'svg-good'}
                stroke="none"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="12"
                fontWeight="700"
              >
                {col.title}
              </text>
            )}

            <g className="svg-ink" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="11.5" textAnchor={anchor}>
              {placed.map((seg, si) => (
                <text key={si} x={labelX} y={seg.y + seg.h / 2 + 4}>
                  {seg.label}
                </text>
              ))}
            </g>

            <text x={x + BAR_W / 2} y={BAR_TOP + BAR_H + 20} textAnchor="middle" className="svg-ink-faint" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12">
              {col.footLabel}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
