import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'vennDiagram' }>, 'caption'>

const W = 360
const H = 220
const CX_A = 150
const CX_B = 210
const CY = 110
const R = 80

/** Diagramme de Venn à 2 ensembles — disposition géométrique fixe (deux cercles superposés de
 * même rayon), seul le contenu des régions change selon le mode. */
export function VennDiagram({ labelA, labelB, mode, counts }: Props) {
  const showUnion = mode === 'highlightUnion'
  const showInter = mode === 'highlightIntersection' || mode === 'counts'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Diagramme de Venn">
      <defs>
        <clipPath id="venn-clip-a">
          <circle cx={CX_A} cy={CY} r={R} />
        </clipPath>
        <clipPath id="venn-clip-b">
          <circle cx={CX_B} cy={CY} r={R} />
        </clipPath>
      </defs>

      {showUnion && (
        <>
          <circle cx={CX_A} cy={CY} r={R} className="svg-band" stroke="none" />
          <circle cx={CX_B} cy={CY} r={R} className="svg-band" stroke="none" />
        </>
      )}
      {showInter && (
        <circle cx={CX_B} cy={CY} r={R} clipPath="url(#venn-clip-a)" className="svg-band" stroke="none" />
      )}

      <circle cx={CX_A} cy={CY} r={R} className="svg-accent-outline" strokeWidth="1.8" />
      <circle cx={CX_B} cy={CY} r={R} className="svg-accent-outline" strokeWidth="1.8" />

      <text x={CX_A - R + 14} y={CY - R + 22} className="svg-accent" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16">
        {labelA}
      </text>
      <text x={CX_B + R - 14} y={CY - R + 22} textAnchor="end" className="svg-accent" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16">
        {labelB}
      </text>

      {mode === 'counts' && counts && (
        <>
          <text x={CX_A - 34} y={CY} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="15">
            {counts.aOnly}
          </text>
          <text x={(CX_A + CX_B) / 2} y={CY} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="15">
            {counts.both}
          </text>
          <text x={CX_B + 34} y={CY} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="15">
            {counts.bOnly}
          </text>
          <text x={20} y={H - 14} className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="13">
            hors A et B : {counts.neither}
          </text>
        </>
      )}
    </svg>
  )
}
