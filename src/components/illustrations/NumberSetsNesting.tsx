import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'numberSetsNesting' }>, 'caption'>

const SIZE_W = 360
const SIZE_H = 300
const CX = 180
const CY = 155

/**
 * Emboîtement ℕ⊂ℤ⊂ℚ⊂ℝ⊂ℂ — ellipses concentriques étiquetées (la plus grande en dernier dans
 * `rings` s'affiche par-dessus visuellement puisqu'on dessine dans l'ordre fourni ; l'appelant
 * fournit les rings du plus grand au plus petit pour que le plus petit reste visible par-dessus),
 * avec des points-exemples libres à l'intérieur.
 */
export function NumberSetsNesting({ rings, examplePoints }: Props) {
  return (
    <svg viewBox={`0 0 ${SIZE_W} ${SIZE_H}`} role="img" aria-label="Emboîtement des ensembles de nombres">
      {rings.map((ring, i) => (
        <g key={i}>
          <ellipse cx={CX} cy={CY} rx={ring.rx} ry={ring.ry} fill="none" className="svg-line" strokeWidth="1.4" />
          <text x={CX} y={CY - ring.ry + 16} textAnchor="middle" className="svg-accent" fontFamily="Fraunces, serif" fontStyle="italic" fontWeight="600" fontSize="15">
            {ring.label}
          </text>
        </g>
      ))}

      {examplePoints.map((p, i) => (
        <g key={i}>
          <circle cx={CX + p.dx} cy={CY + p.dy} r="3" className="svg-ink" />
          <text
            x={CX + p.dx + (p.anchor === 'end' ? -8 : p.anchor === 'start' ? 8 : 0)}
            y={CY + p.dy + (p.anchor ? 4 : -8)}
            textAnchor={p.anchor ?? 'middle'}
            className="svg-ink"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="12"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
