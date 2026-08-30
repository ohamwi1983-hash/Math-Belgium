import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'unitCircleArc' }>, 'caption'>

const CX = 95
const CY = 95
const R = 72
const ARC_R = R * 0.55
const SIZE = 190

/**
 * Cercle trigonométrique + rayon + arc + projection, pour illustrer arcsin/arccos/arctan. La
 * projection est géométriquement différente selon `mode` (pas juste une couleur) : horizontale
 * sur l'axe des y pour sin, verticale sur l'axe des x pour cos, sur la tangente géométrique
 * verticale (x = cx+R) pour tan — voir la note dans types.ts.
 */
export function UnitCircleArc({ mode, angle }: Props) {
  const pointX = CX + R * Math.cos(angle)
  const pointY = CY - R * Math.sin(angle)

  // Pour tan, le rayon s'étend au-delà du cercle jusqu'à la tangente verticale x = CX + R.
  const tanPointX = CX + R
  const tanRadiusLen = R / Math.cos(angle)
  const tanPointY = CY - tanRadiusLen * Math.sin(angle)

  const arcEndX = CX + ARC_R * Math.cos(angle)
  const arcEndY = CY - ARC_R * Math.sin(angle)
  const arcPath = `M ${CX + ARC_R} ${CY} A ${ARC_R} ${ARC_R} 0 0 0 ${arcEndX} ${arcEndY}`

  const radiusEndX = mode === 'tan' ? tanPointX : pointX
  const radiusEndY = mode === 'tan' ? tanPointY : pointY

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Cercle trigonométrique illustrant arc${mode}`}>
      <line x1={CX - R - 8} y1={CY} x2={CX + R + 8} y2={CY} className="svg-line" strokeWidth="1.2" />
      <line x1={CX} y1={CY - R - 8} x2={CX} y2={CY + R + 8} className="svg-line" strokeWidth="1.2" />
      <circle cx={CX} cy={CY} r={R} fill="none" className="svg-line" strokeWidth="1.2" />

      {mode === 'tan' && (
        <line x1={tanPointX} y1={CY - R - 8} x2={tanPointX} y2={CY + R + 8} className="svg-faint" strokeWidth="1.5" />
      )}

      {mode === 'sin' && (
        <>
          <line x1={pointX} y1={pointY} x2={CX - R - 16} y2={pointY} className="svg-faint" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x={CX - R - 20} y={pointY + 4} textAnchor="end" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="12">
            x
          </text>
        </>
      )}
      {mode === 'cos' && (
        <>
          <line x1={pointX} y1={pointY} x2={pointX} y2={CY + R + 16} className="svg-faint" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x={pointX} y={CY + R + 28} textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="12">
            x
          </text>
        </>
      )}

      <path d={arcPath} fill="none" className="svg-accent" style={{ fill: 'none' }} strokeWidth="2" />
      <line x1={CX} y1={CY} x2={radiusEndX} y2={radiusEndY} className="svg-accent" strokeWidth="1.5" />
      <circle cx={radiusEndX} cy={radiusEndY} r="3.5" className="svg-accent" />
      <text
        x={CX + (ARC_R + 12) * Math.cos(angle / 2)}
        y={CY - (ARC_R + 12) * Math.sin(angle / 2)}
        textAnchor="middle"
        className="svg-accent"
        fontFamily="Fraunces, serif"
        fontStyle="italic"
        fontSize="13"
      >
        y
      </text>
    </svg>
  )
}
