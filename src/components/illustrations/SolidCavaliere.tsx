import { useId } from 'react'
import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'solidCavaliere' }>, 'caption'>
type Vertex = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

/**
 * Coordonnées d'un cube en perspective cavalière, recopiées telles quelles depuis la figure
 * source (chapitre HTML "Géométrie dans l'espace") : x horizontal, z vertical, y en diagonale à
 * 45° réduit de moitié. ABCD = base (A avant-gauche, B avant-droit, C arrière-droit, D
 * arrière-gauche), EFGH = face du dessus, E au-dessus de A, etc.
 */
const LARGE: Record<Vertex, { x: number; y: number }> = {
  A: { x: 70, y: 190 },
  B: { x: 170, y: 190 },
  C: { x: 205.36, y: 154.64 },
  D: { x: 105.36, y: 154.64 },
  E: { x: 70, y: 90 },
  F: { x: 170, y: 90 },
  G: { x: 205.36, y: 54.64 },
  H: { x: 105.36, y: 54.64 },
}
const SMALL: Record<Vertex, { x: number; y: number }> = {
  A: { x: 25, y: 110 },
  B: { x: 95, y: 110 },
  C: { x: 119.75, y: 85.25 },
  D: { x: 49.75, y: 85.25 },
  E: { x: 25, y: 40 },
  F: { x: 95, y: 40 },
  G: { x: 119.75, y: 15.25 },
  H: { x: 49.75, y: 15.25 },
}

const VIEWBOX = { large: { w: 300, h: 220 }, small: { w: 160, h: 130 } }
const STROKE = { large: { solid: 1.8, hidden: 1.6 }, small: { solid: 1.5, hidden: 1.3 } }

/** Les 3 arêtes de D (sommet arrière-bas-gauche) sont TOUJOURS cachées — convention fixe, jamais
 * recalculée : c'est le point vérifié empiriquement une fois pour toutes pour ce chapitre. */
const EDGES: { from: Vertex; to: Vertex; hidden: boolean }[] = [
  { from: 'A', to: 'B', hidden: false },
  { from: 'B', to: 'C', hidden: false },
  { from: 'D', to: 'A', hidden: true },
  { from: 'D', to: 'C', hidden: true },
  { from: 'E', to: 'F', hidden: false },
  { from: 'F', to: 'G', hidden: false },
  { from: 'E', to: 'H', hidden: false },
  { from: 'H', to: 'G', hidden: false },
  { from: 'A', to: 'E', hidden: false },
  { from: 'B', to: 'F', hidden: false },
  { from: 'C', to: 'G', hidden: false },
  { from: 'D', to: 'H', hidden: true },
]

const LEFT_VERTICES: Vertex[] = ['A', 'D', 'E', 'H']
const TOP_VERTICES: Vertex[] = ['E', 'F', 'G', 'H']

const LABEL_TONE_CLASS: Record<'ink' | 'plan', string> = { ink: 'svg-ink', plan: 'svg-plan-ink' }
const DOT_TONE_CLASS: Record<'ink' | 'accent', string> = { ink: 'svg-ink', accent: 'svg-accent' }
const LINE_TONE_CLASS: Record<'accent' | 'good', string> = { accent: 'svg-accent', good: 'svg-good' }

/**
 * Solide en perspective cavalière (cube/parallélépipède), sommets nommés A..H. Composant
 * généraliste réutilisé pour toutes les figures bâties sur un solide de ce chapitre : cube nu
 * (mini-comparaisons), cube annoté des 3 axes, plan mis en évidence, arêtes/diagonales mises en
 * évidence, polygone de section libre.
 */
export function SolidCavaliere({ size, showAxes, vertexLabels, highlightedPlane, highlightedLines, freePoints, sectionPolygon }: Props) {
  const markerId = `solid-${useId()}`
  const vb = VIEWBOX[size]
  const pos = size === 'large' ? LARGE : SMALL
  const stroke = STROKE[size]
  const labelDx = size === 'large' ? 14 : 10
  const labelDyBottom = size === 'large' ? 18 : 14
  const labelDyTop = size === 'large' ? -8 : -7

  const labelFor = (v: Vertex) => {
    const isLeft = LEFT_VERTICES.includes(v)
    const isTop = TOP_VERTICES.includes(v)
    return {
      dx: isLeft ? -labelDx : labelDx,
      dy: isTop ? labelDyTop : labelDyBottom,
      anchor: isLeft ? ('end' as const) : ('start' as const),
    }
  }

  return (
    <svg
      viewBox={`0 0 ${vb.w} ${vb.h}`}
      role="img"
      aria-label="Solide en perspective cavalière"
      className={showAxes ? 'svg-cavaliere-axes' : undefined}
    >
      {showAxes && (
        <defs>
          <marker id={`${markerId}-axe`} viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 Z" style={{ fill: 'var(--ink-soft)' }} />
          </marker>
        </defs>
      )}

      {showAxes && size === 'large' && (
        <g>
          <line x1={70} y1={190} x2={255} y2={190} className="svg-line" strokeWidth="1.5" markerEnd={`url(#${markerId}-axe)`} />
          <line x1={70} y1={190} x2={70} y2={18} className="svg-line" strokeWidth="1.5" markerEnd={`url(#${markerId}-axe)`} />
          <line x1={70} y1={190} x2={158} y2={102} className="svg-line" strokeWidth="1.5" strokeDasharray="4 3" markerEnd={`url(#${markerId}-axe)`} />
          <text x={262} y={194} fontSize="14" className="svg-ink" fontStyle="italic" fontFamily="Fraunces, serif">
            x
          </text>
          <text x={70} y={10} fontSize="14" className="svg-ink" fontStyle="italic" fontFamily="Fraunces, serif" textAnchor="middle">
            z
          </text>
          <text x={166} y={98} fontSize="14" className="svg-ink" fontStyle="italic" fontFamily="Fraunces, serif">
            y
          </text>
          <text x={107} y={167} fontSize="11" className="svg-ink-faint">
            45°
          </text>
          <text x={118} y={140} fontSize="10.5" className="svg-ink-faint">
            × ½
          </text>
        </g>
      )}

      {EDGES.map((e, i) => {
        const p1 = pos[e.from]
        const p2 = pos[e.to]
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            className="svg-line"
            strokeWidth={e.hidden ? stroke.hidden : stroke.solid}
            strokeDasharray={e.hidden ? '4 3' : undefined}
          />
        )
      })}

      {highlightedPlane && (
        <polygon
          points={highlightedPlane.vertices.map((v) => `${pos[v].x},${pos[v].y}`).join(' ')}
          className="svg-plan-fill"
        />
      )}

      {highlightedLines?.map((l, i) => {
        const p1 = pos[l.from]
        const p2 = pos[l.to]
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={LINE_TONE_CLASS[l.tone]} strokeWidth={size === 'large' ? 2.4 : 2.6} />
      })}

      {sectionPolygon && (
        <polygon
          points={sectionPolygon.points.map((p) => `${p.x},${p.y}`).join(' ')}
          className="svg-accent"
          style={{ fillOpacity: 0.16 }}
          strokeWidth="2.2"
        />
      )}

      {freePoints?.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4.5" className={p.tone === 'accent' ? 'svg-accent' : 'svg-ink'} />
          {p.label && (
            <text x={p.x - 20} y={p.y + 4} fontSize="14" className={p.tone === 'accent' ? 'svg-accent' : 'svg-ink'} fontStyle="italic" fontFamily="Fraunces, serif">
              {p.label}
            </text>
          )}
        </g>
      ))}

      {vertexLabels?.map((vl, i) => {
        const p = pos[vl.vertex]
        const offset = labelFor(vl.vertex)
        const dotTone = vl.dotTone ?? 'ink'
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={size === 'large' ? 4.5 : 3.5} className={DOT_TONE_CLASS[dotTone]} />
            <text
              x={p.x + offset.dx}
              y={p.y + offset.dy}
              textAnchor={offset.anchor}
              fontSize="14"
              className={LABEL_TONE_CLASS[vl.tone ?? 'ink']}
              fontStyle="italic"
              fontFamily="Fraunces, serif"
            >
              {vl.vertex}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
