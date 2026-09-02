import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'boxPlot' }>, 'caption'>

const X_LEFT = 55
const X_RIGHT = 430
const ROW_HEIGHT = 70
const BOX_HALF = 18

const TONE_CLASS: Record<'accent' | 'good', { box: string; median: string }> = {
  accent: { box: 'svg-bar', median: 'svg-accent' },
  good: { box: 'svg-good-outline', median: 'svg-good' },
}

/** Boîte à moustaches — une ou plusieurs séries empilées, chacune résumée en 5 nombres. */
export function BoxPlot({ series, xAxisLabel }: Props) {
  const allVals = series.flatMap((s) => [s.min, s.max])
  const vMin = Math.min(...allVals)
  const vMax = Math.max(...allVals)
  const pad = (vMax - vMin) * 0.08 || 1
  const xScale = (v: number) => X_LEFT + ((v - (vMin - pad)) / (vMax - vMin + 2 * pad)) * (X_RIGHT - X_LEFT)

  const single = series.length === 1
  const height = series.length * ROW_HEIGHT + (single ? 45 : 35)
  const axisY = series.length * ROW_HEIGHT + 8

  return (
    <svg viewBox={`0 0 460 ${height}`} role="img" aria-label="Boîte à moustaches">
      {series.map((s, i) => {
        const cy = i * ROW_HEIGHT + ROW_HEIGHT / 2
        const tone = TONE_CLASS[s.tone ?? 'accent']
        return (
          <g key={i}>
            <line x1={xScale(s.min)} y1={cy} x2={xScale(s.q1)} y2={cy} className="svg-line" strokeWidth="1.6" />
            <line x1={xScale(s.q3)} y1={cy} x2={xScale(s.max)} y2={cy} className="svg-line" strokeWidth="1.6" />
            <line x1={xScale(s.min)} y1={cy - BOX_HALF * 0.4} x2={xScale(s.min)} y2={cy + BOX_HALF * 0.4} className="svg-line" strokeWidth="1.6" />
            <line x1={xScale(s.max)} y1={cy - BOX_HALF * 0.4} x2={xScale(s.max)} y2={cy + BOX_HALF * 0.4} className="svg-line" strokeWidth="1.6" />
            {s.tone === 'good' ? (
              <rect x={xScale(s.q1)} y={cy - BOX_HALF} width={xScale(s.q3) - xScale(s.q1)} height={BOX_HALF * 2} className={tone.box} strokeWidth="2" />
            ) : (
              <rect x={xScale(s.q1)} y={cy - BOX_HALF} width={xScale(s.q3) - xScale(s.q1)} height={BOX_HALF * 2} className={tone.box} />
            )}
            <line x1={xScale(s.median)} y1={cy - BOX_HALF} x2={xScale(s.median)} y2={cy + BOX_HALF} className={tone.median} strokeWidth="2.2" />

            {s.label && (
              <text x={X_LEFT - 12} y={cy + 4} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12.5">
                {s.label}
              </text>
            )}
            {s.iqrLabel && (
              <text x={xScale(s.median)} y={cy - BOX_HALF - 10} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11">
                {s.iqrLabel}
              </text>
            )}
            {single && (
              <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12" textAnchor="middle">
                {[
                  ['min', s.min],
                  ['Q1', s.q1],
                  ['méd', s.median],
                  ['Q3', s.q3],
                  ['max', s.max],
                ].map(([lbl, val]) => (
                  <g key={lbl}>
                    <line x1={xScale(val as number)} y1={cy - BOX_HALF - 6} x2={xScale(val as number)} y2={axisY} className="svg-faint" strokeWidth="1.2" />
                    <text x={xScale(val as number)} y={axisY + 16}>
                      {lbl}={val}
                    </text>
                  </g>
                ))}
              </g>
            )}
          </g>
        )
      })}

      {!single && (
        <>
          <line x1={X_LEFT - 10} y1={axisY} x2={X_RIGHT + 10} y2={axisY} className="svg-line" strokeWidth="1.4" />
          <text x={X_RIGHT + 16} y={axisY + 4} className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
            {xAxisLabel}
          </text>
        </>
      )}
    </svg>
  )
}
