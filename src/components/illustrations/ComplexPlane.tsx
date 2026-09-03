import { useId } from 'react'
import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'complexPlane' }>, 'caption'>

const L = 320
const H = 300

const LINE_TONE_CLASS: Record<'accent' | 'good' | 'bad' | 'faint', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  faint: 'svg-line',
}

const POINT_TONE_CLASS: Record<'accent' | 'good' | 'bad' | 'ink', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  ink: 'svg-ink',
}

const LABEL_OFFSET: Record<'above' | 'below' | 'left' | 'right', { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }> = {
  above: { dx: 0, dy: -10, anchor: 'middle' },
  below: { dx: 0, dy: 18, anchor: 'middle' },
  left: { dx: -8, dy: 4, anchor: 'end' },
  right: { dx: 8, dy: 4, anchor: 'start' },
}

/**
 * Plan d'Argand — axes Re/Im, points d'affixe (x;y), vecteurs (pleins ou pointillés, avec
 * éventuelle marque de longueur égale), arcs d'angle à centre libre, cercle et polygone
 * optionnels. Composant généraliste réutilisé pour la quasi-totalité des diagrammes du chapitre
 * sur les nombres complexes — dans le même esprit que la généralisation de `circleDiagram`.
 */
export function ComplexPlane({ xMin, xMax, yMin, yMax, circle, polygon, vectors, points, angleArcs }: Props) {
  const markerId = `cplane-${useId()}`
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * L
  const yScale = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H

  const axisX0 = xScale(0)
  const axisY0 = yScale(0)

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
    <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label="Plan d'Argand">
      <defs>
        {(['accent', 'good', 'bad', 'faint'] as const).map((tone) => (
          <marker key={tone} id={`${markerId}-${tone}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" className={LINE_TONE_CLASS[tone]} />
          </marker>
        ))}
      </defs>

      {/* axes Re / Im, à travers l'origine si elle est dans le cadre */}
      <line x1={0} y1={axisY0} x2={L} y2={axisY0} className="svg-line" strokeWidth="1.2" />
      <line x1={axisX0} y1={H} x2={axisX0} y2={0} className="svg-line" strokeWidth="1.2" />
      <text x={L - 6} y={axisY0 - 8} textAnchor="end" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
        Re
      </text>
      <text x={axisX0 + 8} y={12} className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13">
        Im
      </text>

      {circle && (
        <circle
          cx={xScale(circle.cx)}
          cy={yScale(circle.cy)}
          r={((circle.r / (xMax - xMin)) * L + (circle.r / (yMax - yMin)) * H) / 2}
          fill="none"
          className={circle.tone === 'accent' ? 'svg-accent-outline' : 'svg-line'}
          strokeWidth={circle.tone === 'accent' ? '1.6' : '1'}
        />
      )}

      {polygon && (
        <polygon
          points={polygon.points.map((p) => `${xScale(p.x).toFixed(1)},${yScale(p.y).toFixed(1)}`).join(' ')}
          fill="none"
          className={polygon.tone === 'accent' ? 'svg-accent-outline' : 'svg-line'}
          strokeWidth={polygon.tone === 'accent' ? '1.8' : '1'}
        />
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
              markerEnd={v.dashed ? undefined : `url(#${markerId}-${v.tone})`}
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

      {points?.map((p, i) => {
        const cx = xScale(p.x)
        const cy = yScale(p.y)
        const offset = LABEL_OFFSET[p.labelPos ?? 'above']
        return (
          <g key={i}>
            {p.node !== false && <circle cx={cx} cy={cy} r="3.6" className={POINT_TONE_CLASS[p.tone]} />}
            {p.label && (
              <text x={cx + offset.dx} y={cy + offset.dy} textAnchor={offset.anchor} className={POINT_TONE_CLASS[p.tone]} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14">
                {p.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
