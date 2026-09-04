import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'categoricalBarChart' }>, 'caption'>

type Tone = 'accent' | 'good' | 'faint'

const BAR_FILL: Record<Tone, string> = {
  accent: 'var(--accent)',
  good: 'var(--good)',
  faint: 'var(--ink-faint)',
}
const BAR_OPACITY: Record<Tone, number> = { accent: 0.75, good: 0.75, faint: 0.4 }
const TEXT_CLASS: Record<Tone, string> = { accent: 'svg-accent', good: 'svg-good', faint: 'svg-ink-faint' }

const W = 460

/**
 * Barres à catégories nommées — verticales (distribution indexée par k, comparaison de 2 sommes)
 * ou horizontales (catégories aux libellés longs), échelle linéaire ou logarithmique.
 */
export function CategoricalBarChart({
  bars,
  orientation = 'vertical',
  scale = 'linear',
  maxValue,
  logMin = 2,
  xAxisLabel,
  yAxisLabel,
  footnote,
  colorValueLabels = false,
}: Props) {
  const top = Math.max(maxValue ?? 0, ...bars.map((b) => b.value))
  const logMax = Math.log10(top) + 0.1
  const fraction = (v: number) => (scale === 'log' ? (Math.log10(v) - logMin) / (logMax - logMin) : v / top)

  if (orientation === 'horizontal') {
    const LABEL_RIGHT = 132
    const LEFT = 140
    const MAX_LEN = 232
    const ROW_H = 34
    const TOP = 18
    const H = TOP + bars.length * ROW_H + (footnote ? 34 : 12)

    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Comparaison de catégories en barres horizontales">
        {bars.map((b, i) => {
          const tone: Tone = b.tone ?? 'accent'
          const len = Math.max(0, fraction(b.value)) * MAX_LEN
          const y = TOP + i * ROW_H
          return (
            <g key={i}>
              <text x={LABEL_RIGHT} y={y + ROW_H / 2 + 4} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
                {b.label}
              </text>
              <rect x={LEFT} y={y + (ROW_H - 18) / 2} width={len} height="18" rx="2" fill={BAR_FILL[tone]} opacity={BAR_OPACITY[tone]} />
              <text
                x={LEFT + len + 7}
                y={y + ROW_H / 2 + 4}
                className={colorValueLabels ? TEXT_CLASS[tone] : 'svg-ink-faint'}
                stroke="none"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="12"
              >
                {b.valueLabel ?? b.value}
              </text>
            </g>
          )
        })}
        {footnote && (
          <text x={W / 2} y={H - 8} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
            {footnote}
          </text>
        )}
      </svg>
    )
  }

  const LEFT = 52
  const RIGHT = 438
  const TOP = 34
  const BOTTOM = 224
  const H = BOTTOM + (xAxisLabel ? 54 : 30) + (footnote ? 18 : 0)
  const slot = (RIGHT - LEFT) / bars.length
  const barW = slot * 0.55

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Diagramme en barres par catégorie">
      <line x1={LEFT} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} className="svg-line" strokeWidth="1.5" />
      <line x1={LEFT} y1={TOP} x2={LEFT} y2={BOTTOM} className="svg-line" strokeWidth="1.5" />

      {bars.map((b, i) => {
        const tone: Tone = b.tone ?? 'accent'
        const h = Math.max(0, fraction(b.value)) * (BOTTOM - TOP)
        const x = LEFT + i * slot + (slot - barW) / 2
        const y = BOTTOM - h
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill={BAR_FILL[tone]} opacity={BAR_OPACITY[tone]} />
            <text
              x={x + barW / 2}
              y={y - 7}
              textAnchor="middle"
              className={colorValueLabels ? TEXT_CLASS[tone] : 'svg-ink-faint'}
              stroke="none"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="12"
              fontWeight={colorValueLabels ? 700 : 400}
            >
              {b.valueLabel ?? b.value}
            </text>
            <text x={x + barW / 2} y={BOTTOM + 18} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
              {b.label}
            </text>
          </g>
        )
      })}

      {yAxisLabel && (
        <text x="10" y={TOP - 12} className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
          {yAxisLabel}
        </text>
      )}
      {xAxisLabel && (
        <text x={(LEFT + RIGHT) / 2} y={BOTTOM + 44} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
          {xAxisLabel}
        </text>
      )}
      {footnote && (
        <text x={(LEFT + RIGHT) / 2} y={H - 6} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
          {footnote}
        </text>
      )}
    </svg>
  )
}
