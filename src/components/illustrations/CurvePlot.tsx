import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'curvePlot' }>, 'caption'>

// Deux formats : "wide" (existant, pour les graphes pleine largeur — paraboles, arctan sur un
// large domaine) et "compact" (≈1,2:1, proche des proportions réelles de la source pour un
// graphe individuel — ex. arcsin/arccos seuls). Le format wide, étiré à 2,2:1, rend ces
// graphes-là disproportionnellement bas une fois contraints à une largeur d'écran mobile.
const WIDE = { viewBox: '0 0 640 290', xLeft: 70, xRight: 610, yTop: 20, yBottom: 250 }
const COMPACT = { viewBox: '0 0 320 260', xLeft: 45, xRight: 300, yTop: 20, yBottom: 220 }
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

const LABEL_TONE_CLASS: Record<'accent' | 'good' | 'bad' | 'faint' | 'ink', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  faint: 'svg-ink-faint',
  ink: 'svg-ink',
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
  yTicks,
  yTickLabels,
  axisOfSymmetry,
  horizontalAsymptotes,
  obliqueAsymptotes,
  shadedRegions,
  textLabels,
  verticalAsymptotes,
  points,
  roots,
  imageBand,
  testLine,
  xAxisLabel,
  yAxisLabel,
  showYAxis = true,
  fixedYRange,
  compact = false,
}: Props) {
  const { viewBox, xLeft: X_LEFT, xRight: X_RIGHT, yTop: Y_TOP, yBottom: Y_BOTTOM } = compact ? COMPACT : WIDE

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
  // Une marge de tolérance (30% de la hauteur visible) laisse la courbe "sortir" un peu du cadre
  // de façon naturelle (ex. une exponentielle qui grimpe fort en bord de fenêtre) sans jamais la
  // laisser filer arbitrairement loin au-dessus/en-dessous — sinon le trait traverse tout le cadre
  // visuellement, bien au-delà de la fenêtre mathématique demandée.
  const margin = (yTop - yBottom) * 0.3
  const pathFor = (c: { fn: (x: number) => number; xMin?: number; xMax?: number }) => {
    const cMin = c.xMin ?? xMin
    const cMax = c.xMax ?? xMax
    const cxs = Array.from({ length: SAMPLES + 1 }, (_, i) => cMin + ((cMax - cMin) * i) / SAMPLES)
    const segments: string[][] = []
    let current: string[] = []
    for (const x of cxs) {
      const y = c.fn(x)
      const inRange = Number.isFinite(y) && y <= yTop + margin && y >= yBottom - margin
      if (!inRange) {
        if (current.length > 1) segments.push(current)
        current = []
        continue
      }
      current.push(`${xScale(x).toFixed(2)},${yScale(y).toFixed(2)}`)
    }
    if (current.length > 1) segments.push(current)
    return segments.map((seg) => `M${seg.join(' L')}`).join(' ')
  }

  return (
    <svg viewBox={viewBox} role="img" aria-label="Graphe de fonction(s)">
      {shadedRegions?.map((r, i) => {
        const lower = r.lower ?? (() => 0)
        const steps = 40
        const upperPts = Array.from({ length: steps + 1 }, (_, k) => {
          const x = r.from + ((r.to - r.from) * k) / steps
          return `${xScale(x).toFixed(1)},${yScale(r.upper(x)).toFixed(1)}`
        })
        const lowerPts = Array.from({ length: steps + 1 }, (_, k) => {
          const x = r.to - ((r.to - r.from) * k) / steps
          return `${xScale(x).toFixed(1)},${yScale(lower(x)).toFixed(1)}`
        })
        const toneClass = r.tone === 'good' ? 'svg-band-good' : r.tone === 'bad' ? 'svg-band-bad' : 'svg-band'
        return <polygon key={i} points={[...upperPts, ...lowerPts].join(' ')} className={toneClass} />
      })}
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
      {showYAxis && yTicks && (
        <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11">
          {yTicks.map((t) => (
            <text key={t} x={zeroX - 8} y={yScale(t) + 4} textAnchor="end">
              {yTickLabels?.[t] ?? t}
            </text>
          ))}
        </g>
      )}
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

      {horizontalAsymptotes?.map((a, i) => {
        const labelY = yScale(a.y) + (a.y >= 0 ? -6 : 16)
        // Une asymptote horizontale proche du haut du cadre (yTop) place son label tout près de
        // yAxisLabel, positionné lui aussi juste sous Y_TOP — collision fréquente dès que la
        // borne haute de la fenêtre y est proche de la valeur de l'asymptote. On décale alors le
        // label horizontalement, au-delà de yAxisLabel, plutôt que de rivaliser pour la même
        // bande verticale.
        const nearYAxisLabel = showYAxis && Math.abs(labelY - (Y_TOP + 10)) < 20
        return (
          <g key={i}>
            <line x1={X_LEFT} y1={yScale(a.y)} x2={X_RIGHT} y2={yScale(a.y)} className="svg-faint" strokeWidth="1.5" strokeDasharray="4 4" />
            {a.label && (
              <text
                x={nearYAxisLabel ? zeroX + 28 : X_LEFT + 6}
                y={labelY}
                className="svg-ink"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="12"
              >
                {a.label}
              </text>
            )}
          </g>
        )
      })}
      {verticalAsymptotes?.map((a, i) => {
        // Une asymptote verticale en x=0 coïncide avec l'axe y lui-même : son label, positionné
        // par défaut juste sous Y_TOP comme yAxisLabel, s'y superposerait directement (cas
        // fréquent pour un logarithme). On le décale alors plus bas pour dégager yAxisLabel.
        const nearYAxis = showYAxis && Math.abs(xScale(a.x) - zeroX) < 20
        return (
          <g key={i}>
            <line x1={xScale(a.x)} y1={Y_BOTTOM} x2={xScale(a.x)} y2={Y_TOP} className="svg-faint" strokeWidth="1.5" strokeDasharray="4 4" />
            {a.label && (
              <text
                x={xScale(a.x) + 6}
                y={nearYAxis ? Y_TOP + 26 : Y_TOP + 12}
                className="svg-ink"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="12"
              >
                {a.label}
              </text>
            )}
          </g>
        )
      })}

      {obliqueAsymptotes?.map((asym, i) => {
        const y1 = asym.a * xMin + asym.b
        const y2 = asym.a * xMax + asym.b
        // Étiquette près de l'extrémité droite de la droite, légèrement au-dessus si la pente
        // est positive (pour ne pas chevaucher le trait), en-dessous sinon.
        const labelY = yScale(y2) + (asym.a >= 0 ? -8 : 16)
        return (
          <g key={i}>
            <line x1={xScale(xMin)} y1={yScale(y1)} x2={xScale(xMax)} y2={yScale(y2)} className="svg-good-outline" strokeWidth="1.6" strokeDasharray="5 4" />
            {asym.label && (
              <text x={X_RIGHT - 4} y={labelY} textAnchor="end" className="svg-good" fontFamily="IBM Plex Mono, monospace" fontSize="12">
                {asym.label}
              </text>
            )}
          </g>
        )
      })}

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

      {points?.map((p, i) => {
        const pos = p.labelPos ?? (p.y >= 0 ? 'above' : 'below')
        const px = xScale(p.x)
        const py = yScale(p.y)
        const textProps =
          pos === 'above'
            ? { x: px, y: py - 10, textAnchor: 'middle' as const }
            : pos === 'below'
              ? { x: px, y: py + 20, textAnchor: 'middle' as const }
              : pos === 'left'
                ? { x: px - 10, y: py + 20, textAnchor: 'end' as const }
                : { x: px + 10, y: py + 20, textAnchor: 'start' as const }
        return (
          <g key={i}>
            <circle
              cx={px}
              cy={py}
              r="5"
              className={POINT_TONE_CLASS[p.tone]}
              style={p.style === 'open' ? { fill: 'var(--surface)' } : undefined}
              strokeWidth={p.style === 'open' ? '2.5' : undefined}
            />
            <text {...textProps} className={POINT_TONE_CLASS[p.tone]} fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600">
              {p.label}
            </text>
          </g>
        )
      })}

      {textLabels?.map((t, i) => (
        <text
          key={i}
          x={xScale(t.x)}
          y={yScale(t.y)}
          textAnchor={t.anchor ?? 'start'}
          className={LABEL_TONE_CLASS[t.tone ?? 'ink']}
          fontFamily="IBM Plex Mono, monospace"
          fontSize="12"
        >
          {t.text}
        </text>
      ))}

      <defs>
        <marker id="cp-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  )
}
