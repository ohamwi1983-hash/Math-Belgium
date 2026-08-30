import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'curvePlot' }>, 'caption'>

const X_LEFT = 70
const X_RIGHT = 610
const Y_TOP = 20
const Y_BOTTOM = 250
const SAMPLES = 100

const TONE_CLASS: Record<'accent' | 'faint' | 'good' | 'bad', string> = {
  accent: 'svg-accent',
  faint: 'svg-line',
  good: 'svg-good',
  bad: 'svg-bad',
}

const POINT_TONE_CLASS: Record<'accent' | 'good' | 'bad', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
}

/**
 * Trace une ou plusieurs courbes sur les mêmes axes, avec accessoires optionnels : axe de
 * symétrie, points marqués (ex. sommet), racines sur l'axe des x, bande d'image ombrée.
 * Généralise `FunctionGraph` pour couvrir les besoins des paraboles (échelle verticale signée,
 * plusieurs courbes superposées) sans dupliquer le moteur de tracé par cas d'usage.
 */
export function CurvePlot({
  curves,
  xMin,
  xMax,
  xTicks,
  xTickLabels,
  axisOfSymmetry,
  horizontalAsymptotes,
  verticalAsymptotes,
  points,
  roots,
  imageBand,
  testLine,
  xAxisLabel,
  yAxisLabel,
  showYAxis = true,
  fixedYRange,
}: Props) {
  let yTop: number, yBottom: number
  if (fixedYRange) {
    yTop = fixedYRange.max
    yBottom = fixedYRange.min
  } else {
    const allYs = curves
      .flatMap((c) => {
        const cMin = c.xMin ?? xMin
        const cMax = c.xMax ?? xMax
        return Array.from({ length: SAMPLES + 1 }, (_, i) => c.fn(cMin + ((cMax - cMin) * i) / SAMPLES))
      })
      .filter(Number.isFinite)
      .concat((points ?? []).map((p) => p.y))
    const yMax = Math.max(...allYs, 0)
    const yMin = Math.min(...allYs, 0)
    // Marge pour ne pas coller les extrema au bord du cadre.
    const span = yMax - yMin || 1
    yTop = yMax + span * 0.12
    yBottom = yMin - span * 0.12
  }

  const xScale = (v: number) => X_LEFT + ((v - xMin) / (xMax - xMin)) * (X_RIGHT - X_LEFT)
  const yScale = (v: number) => Y_BOTTOM - ((v - yBottom) / (yTop - yBottom)) * (Y_BOTTOM - Y_TOP)
  const zeroY = yScale(0)
  // L'axe vertical se plante à x=0 réel, pas au bord gauche du cadre — sinon il seed déporté dès
  // que xMin < 0 (le cas courant pour une parabole), contrairement à ce que suggère une lecture
  // rapide de FunctionGraph (qui a cette propriété "gratuitement" car son xAxisMin=X_LEFT par
  // construction, ce qui n'est plus vrai ici puisque l'échelle est calée sur xMin).
  const zeroX = xScale(0)

  // Chaque courbe peut avoir son propre sous-intervalle d'échantillonnage (ex. portion restreinte
  // en accent sur fond de courbe complète en fané) — par défaut, l'intervalle du graphe entier.
  const pathFor = (c: { fn: (x: number) => number; xMin?: number; xMax?: number }) => {
    const cMin = c.xMin ?? xMin
    const cMax = c.xMax ?? xMax
    const cxs = Array.from({ length: SAMPLES + 1 }, (_, i) => cMin + ((cMax - cMin) * i) / SAMPLES)
    return cxs.map((x, i) => `${i === 0 ? 'M' : 'L'}${xScale(x).toFixed(2)},${yScale(c.fn(x)).toFixed(2)}`).join(' ')
  }

  return (
    <svg viewBox="0 0 640 290" role="img" aria-label="Graphe de fonction(s)">
      {imageBand &&
        (() => {
          const topValue = imageBand.direction === 'up' ? yTop : imageBand.from
          const bottomValue = imageBand.direction === 'up' ? imageBand.from : yBottom
          return (
            <rect
              x={X_LEFT}
              y={yScale(topValue)}
              width={X_RIGHT - X_LEFT}
              height={yScale(bottomValue) - yScale(topValue)}
              className="svg-surface2"
              opacity="0.5"
            />
          )
        })()}

      {showYAxis && <line x1={zeroX} y1={Y_BOTTOM} x2={zeroX} y2={Y_TOP} className="svg-line" strokeWidth="1.5" markerEnd="url(#cp-arrow)" />}
      <line x1={X_LEFT} y1={zeroY} x2={X_RIGHT} y2={zeroY} className="svg-line" strokeWidth="1.5" markerEnd="url(#cp-arrow)" />

      <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11">
        {xTicks.map((t) => (
          <text key={t} x={xScale(t)} y={zeroY + 16} textAnchor="middle">
            {xTickLabels?.[t] ?? t}
          </text>
        ))}
      </g>
      <text x={X_RIGHT} y={zeroY - 8} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {xAxisLabel}
      </text>
      {showYAxis && (
        <text x={zeroX + 8} y={Y_TOP + 10} className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
          {yAxisLabel}
        </text>
      )}

      {axisOfSymmetry && (
        <>
          <line
            x1={xScale(axisOfSymmetry.x)}
            y1={Y_BOTTOM}
            x2={xScale(axisOfSymmetry.x)}
            y2={Y_TOP}
            className="svg-faint"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={xScale(axisOfSymmetry.x) + 8}
            y={Y_TOP + 12}
            className="svg-ink"
            fontFamily="Fraunces, serif"
            fontStyle="italic"
            fontSize="13"
          >
            {axisOfSymmetry.label}
          </text>
        </>
      )}

      {horizontalAsymptotes?.map((a, i) => (
        <line key={i} x1={X_LEFT} y1={yScale(a.y)} x2={X_RIGHT} y2={yScale(a.y)} className="svg-faint" strokeWidth="1.5" strokeDasharray="4 4" />
      ))}
      {verticalAsymptotes?.map((a, i) => (
        <line key={i} x1={xScale(a.x)} y1={Y_BOTTOM} x2={xScale(a.x)} y2={Y_TOP} className="svg-faint" strokeWidth="1.5" strokeDasharray="4 4" />
      ))}

      {testLine && (
        <>
          <line x1={X_LEFT} y1={yScale(testLine.y)} x2={X_RIGHT} y2={yScale(testLine.y)} className="svg-faint" strokeWidth="1.5" strokeDasharray="3 3" />
          {testLine.points.map((p, i) => (
            <circle key={i} cx={xScale(p.x)} cy={yScale(testLine.y)} r="4" className="svg-bad" />
          ))}
        </>
      )}

      {curves.map((c, i) => (
        <path
          key={i}
          d={pathFor(c)}
          // `style` (not the `fill` attribute) so this actually wins over .svg-bad/.svg-good,
          // which set fill for their solid-marker use elsewhere — same trap documented in
          // DomainNumberLine. A curve is never filled regardless of tone.
          style={{ fill: 'none' }}
          className={TONE_CLASS[c.tone]}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      ))}

      {roots?.map((r, i) => (
        <g key={i}>
          <circle cx={xScale(r.x)} cy={zeroY} r="5" className="svg-accent" />
          {r.label && (
            <text x={xScale(r.x)} y={zeroY + 34} textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600">
              {r.label}
            </text>
          )}
        </g>
      ))}

      {points?.map((p, i) => (
        <g key={i}>
          <circle cx={xScale(p.x)} cy={yScale(p.y)} r="5" className={POINT_TONE_CLASS[p.tone]} />
          <text
            x={xScale(p.x)}
            y={yScale(p.y) + (p.y >= 0 ? -10 : 20)}
            textAnchor="middle"
            className={POINT_TONE_CLASS[p.tone]}
            fontFamily="IBM Plex Mono, monospace"
            fontSize="13"
            fontWeight="600"
          >
            {p.label}
          </text>
        </g>
      ))}

      <defs>
        <marker id="cp-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  )
}
