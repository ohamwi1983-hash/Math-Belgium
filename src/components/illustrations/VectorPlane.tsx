import { useId } from 'react'
import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'vectorPlane' }>, 'caption'>

const L = 320
const H = 300

const LINE_TONE_CLASS: Record<'accent' | 'good' | 'bad' | 'attn' | 'tip' | 'ink' | 'faint', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  attn: 'svg-attn',
  tip: 'svg-tip',
  ink: 'svg-ink',
  faint: 'svg-line',
}

const POINT_TONE_CLASS: Record<'accent' | 'good' | 'bad' | 'attn' | 'tip' | 'ink', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  attn: 'svg-attn',
  tip: 'svg-tip',
  ink: 'svg-ink',
}

const LABEL_OFFSET: Record<'above' | 'below' | 'left' | 'right', { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }> = {
  above: { dx: 0, dy: -10, anchor: 'middle' },
  below: { dx: 0, dy: 18, anchor: 'middle' },
  left: { dx: -8, dy: 4, anchor: 'end' },
  right: { dx: 8, dy: 4, anchor: 'start' },
}

const SAMPLES = 60

/**
 * Plan cartésien x/y — points, vecteurs (pleins ou pointillés, avec éventuelle marque de longueur
 * égale), arcs d'angle et marqueurs d'angle droit à orientation libre. Composant généraliste
 * réutilisé pour la quasi-totalité des diagrammes du chapitre sur le calcul vectoriel — même
 * conception que `complexPlane`, avec des axes x/y plutôt que Re/Im. Étendu pour le chapitre sur
 * la géométrie analytique (droites, cercles, paraboles) : axes/quadrillage optionnels, cercle,
 * courbes échantillonnées (`curves`/`curvesOfY`) et vecteurs sans pointe de flèche
 * (`arrow: false`, pour une droite entière plutôt qu'un vecteur borné) — tous les nouveaux champs
 * sont optionnels et n'affectent aucun rendu existant du chapitre calcul vectoriel.
 */
export function VectorPlane({ xMin, xMax, yMin, yMax, showAxes = true, grid = false, circle, curves, curvesOfY, vectors, points, angleArcs, rightAngleMarkers }: Props) {
  const markerId = `vplane-${useId()}`
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * L
  const yScale = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H

  const axisX0 = xScale(0)
  const axisY0 = yScale(0)

  const pathForCurve = (c: { fn: (x: number) => number; xMin?: number; xMax?: number }) => {
    const cMin = c.xMin ?? xMin
    const cMax = c.xMax ?? xMax
    const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const x = cMin + ((cMax - cMin) * i) / SAMPLES
      return `${xScale(x).toFixed(2)},${yScale(c.fn(x)).toFixed(2)}`
    })
    return `M${pts.join(' L')}`
  }
  const pathForCurveOfY = (c: { fn: (y: number) => number; yMin?: number; yMax?: number }) => {
    const cMin = c.yMin ?? yMin
    const cMax = c.yMax ?? yMax
    const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const y = cMin + ((cMax - cMin) * i) / SAMPLES
      return `${xScale(c.fn(y)).toFixed(2)},${yScale(y).toFixed(2)}`
    })
    return `M${pts.join(' L')}`
  }

  // Arc SVG entre deux angles en degrés (convention standard, sens direct = trigonométrique),
  // centré sur un point (cx,cy) donné en coordonnées données, avec un rayon fixe en pixels.
  const arcPath = (cx: number, cy: number, fromDeg: number, toDeg: number, radiusPx: number) => {
    const cxPx = xScale(cx)
    const cyPx = yScale(cy)
    const fromRad = (fromDeg * Math.PI) / 180
    const toRad = (toDeg * Math.PI) / 180
    const x1 = cxPx + radiusPx * Math.cos(fromRad)
    const y1 = cyPx - radiusPx * Math.sin(fromRad)
    const x2 = cxPx + radiusPx * Math.cos(toRad)
    const y2 = cyPx - radiusPx * Math.sin(toRad)
    const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0
    return { d: `M${x1.toFixed(1)},${y1.toFixed(1)} A${radiusPx},${radiusPx} 0 ${large} 0 ${x2.toFixed(1)},${y2.toFixed(1)}`, midX: cxPx + (radiusPx + 14) * Math.cos((fromRad + toRad) / 2), midY: cyPx - (radiusPx + 14) * Math.sin((fromRad + toRad) / 2) }
  }

  return (
    <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label="Plan cartésien">
      <defs>
        {(['accent', 'good', 'bad', 'attn', 'tip', 'ink', 'faint'] as const).map((tone) => (
          <marker key={tone} id={`${markerId}-${tone}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" className={LINE_TONE_CLASS[tone]} />
          </marker>
        ))}
      </defs>

      {grid && (
        <g className="svg-grid" strokeWidth="1">
          {Array.from({ length: Math.floor(xMax) - Math.ceil(xMin) + 1 }, (_, i) => Math.ceil(xMin) + i).map((gx) => (
            <line key={`gx-${gx}`} x1={xScale(gx)} y1={0} x2={xScale(gx)} y2={H} />
          ))}
          {Array.from({ length: Math.floor(yMax) - Math.ceil(yMin) + 1 }, (_, i) => Math.ceil(yMin) + i).map((gy) => (
            <line key={`gy-${gy}`} x1={0} y1={yScale(gy)} x2={L} y2={yScale(gy)} />
          ))}
        </g>
      )}

      {circle && (
        <circle
          cx={xScale(circle.cx)}
          cy={yScale(circle.cy)}
          r={((circle.r / (xMax - xMin)) * L + (circle.r / (yMax - yMin)) * H) / 2}
          fill="none"
          className={circle.tone === 'faint' ? 'svg-line' : 'svg-accent-outline'}
          strokeWidth={circle.tone === 'faint' ? '1' : '1.8'}
        />
      )}

      {curves?.map((c, i) => <path key={`curve-${i}`} d={pathForCurve(c)} style={{ fill: 'none' }} className={LINE_TONE_CLASS[c.tone]} strokeWidth="2.2" strokeLinejoin="round" />)}
      {curvesOfY?.map((c, i) => <path key={`curveY-${i}`} d={pathForCurveOfY(c)} style={{ fill: 'none' }} className={LINE_TONE_CLASS[c.tone]} strokeWidth="2.2" strokeLinejoin="round" />)}

      {/* axes x / y, à travers l'origine si elle est dans le cadre */}
      {showAxes && (
        <>
          <line x1={0} y1={axisY0} x2={L} y2={axisY0} className="svg-line" strokeWidth="1.2" />
          <line x1={axisX0} y1={H} x2={axisX0} y2={0} className="svg-line" strokeWidth="1.2" />
          <text x={L - 6} y={axisY0 - 8} textAnchor="end" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
            x
          </text>
          <text x={axisX0 + 8} y={12} className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
            y
          </text>
        </>
      )}

      {vectors?.map((v, i) => {
        const x1 = xScale(v.from.x)
        const y1 = yScale(v.from.y)
        const x2 = xScale(v.to.x)
        const y2 = yScale(v.to.y)
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.hypot(dx, dy) || 1
        const perpX = (-dy / len) * 7
        const perpY = (dx / len) * 7
        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={LINE_TONE_CLASS[v.tone]}
              strokeWidth="1.8"
              strokeDasharray={v.dashed ? '4 3' : undefined}
              markerEnd={v.dashed || v.arrow === false ? undefined : `url(#${markerId}-${v.tone})`}
            />
            {v.tick && (
              <line x1={midX - perpX} y1={midY - perpY} x2={midX + perpX} y2={midY + perpY} className={LINE_TONE_CLASS[v.tone]} strokeWidth="1.8" />
            )}
          </g>
        )
      })}

      {angleArcs?.map((a, i) => {
        const { d, midX, midY } = arcPath(a.cx, a.cy, a.fromDeg, a.toDeg, a.radiusPx)
        return (
          <g key={i}>
            <path d={d} style={{ fill: 'none' }} className={a.tone ? LINE_TONE_CLASS[a.tone] : 'svg-line'} strokeWidth="1.5" />
            {a.label && (
              <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle" className={a.tone ? POINT_TONE_CLASS[a.tone] : 'svg-ink'} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
                {a.label}
              </text>
            )}
          </g>
        )
      })}

      {rightAngleMarkers?.map((m, i) => {
        const vx = xScale(m.vertex.x)
        const vy = yScale(m.vertex.y)
        const size = m.size ?? 10
        const dir = (p: { x: number; y: number }) => {
          const px = xScale(p.x) - vx
          const py = yScale(p.y) - vy
          const len = Math.hypot(px, py) || 1
          return { ux: px / len, uy: py / len }
        }
        const d1 = dir(m.arm1)
        const d2 = dir(m.arm2)
        const p1x = vx + d1.ux * size
        const p1y = vy + d1.uy * size
        const p3x = vx + d2.ux * size
        const p3y = vy + d2.uy * size
        const p2x = p1x + d2.ux * size
        const p2y = p1y + d2.uy * size
        return (
          <polyline
            key={i}
            points={`${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)} ${p3x.toFixed(1)},${p3y.toFixed(1)}`}
            fill="none"
            className="svg-line"
            strokeWidth="1.2"
          />
        )
      })}

      {points?.map((p, i) => {
        const cx = xScale(p.x)
        const cy = yScale(p.y)
        const offset = LABEL_OFFSET[p.labelPos ?? 'above']
        return (
          <g key={i}>
            {p.node !== false && <circle cx={cx} cy={cy} r="3.6" className={POINT_TONE_CLASS[p.tone]} />}
            {p.vectorLabel ? (
              <text x={cx + offset.dx} y={cy + offset.dy} textAnchor={offset.anchor} className={POINT_TONE_CLASS[p.tone]} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14">
                {p.vectorLabel.map((run, j) =>
                  run.vector ? (
                    <tspan key={j}>
                      <tspan className="svg-vecname">{run.text}</tspan>
                      <tspan dy="-0.68em">
                        <tspan className="svg-vechead">▸</tspan>
                      </tspan>
                      <tspan dy="0.68em"> </tspan>
                    </tspan>
                  ) : (
                    <tspan key={j}>{run.text}</tspan>
                  ),
                )}
              </text>
            ) : (
              p.label && (
                <text x={cx + offset.dx} y={cy + offset.dy} textAnchor={offset.anchor} className={POINT_TONE_CLASS[p.tone]} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14">
                  {p.label}
                </text>
              )
            )}
          </g>
        )
      })}
    </svg>
  )
}
