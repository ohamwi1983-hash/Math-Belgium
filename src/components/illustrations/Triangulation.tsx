import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'triangulation' }>, 'caption'>

const A = { x: 40, y: 220 }
const B = { x: 160, y: 220 }
const F = { x: 320, y: 220 }
const S = { x: 320, y: 60 }

/** Triangulation — A et B au sol, alignés avec le pied F d'une tour verticale de sommet S, deux
 * visées d'élévation depuis A et B. Forme géométrique fixe, propre à ce seul diagramme. */
export function Triangulation({ labels }: Props) {
  return (
    <svg viewBox="0 30 380 210" role="img" aria-label="Triangulation pour mesurer une hauteur inaccessible">
      <line x1={A.x} y1={A.y} x2={F.x} y2={F.y} className="svg-line" strokeWidth="1.5" />
      <line x1={F.x} y1={F.y} x2={S.x} y2={S.y} className="svg-good" strokeWidth="2" />
      <line x1={A.x} y1={A.y} x2={S.x} y2={S.y} className="svg-accent-outline" strokeWidth="1.6" strokeDasharray="4 3" />
      <line x1={B.x} y1={B.y} x2={S.x} y2={S.y} className="svg-accent-outline" strokeWidth="1.6" strokeDasharray="4 3" />
      <rect x={F.x - 10} y={F.y - 10} width="10" height="10" fill="none" className="svg-line" strokeWidth="1.1" />
      <circle cx={B.x} cy={B.y} r="3" className="svg-ink" />

      <path d={`M${A.x + 24},${A.y} A24,24 0 0 0 ${A.x + 24 * Math.cos(Math.atan2(S.y - A.y, S.x - A.x) * -1)},${A.y + 24 * Math.sin(Math.atan2(S.y - A.y, S.x - A.x) * -1)}`} fill="none" className="svg-accent-outline" strokeWidth="1.4" />
      <path d={`M${B.x + 24},${B.y} A24,24 0 0 0 ${B.x + 24 * Math.cos(Math.atan2(S.y - B.y, S.x - B.x) * -1)},${B.y + 24 * Math.sin(Math.atan2(S.y - B.y, S.x - B.x) * -1)}`} fill="none" className="svg-accent-outline" strokeWidth="1.4" />
      <text x={A.x + 33} y={A.y - 14} fontSize="13" className="svg-accent" fontStyle="italic">
        {labels.angleAtA}
      </text>
      <text x={B.x + 30} y={B.y - 15} fontSize="13" className="svg-accent" fontStyle="italic">
        {labels.angleAtB}
      </text>

      <text x={(A.x + B.x) / 2} y={A.y - 6} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" className="svg-ink">
        {labels.distanceLabel}
      </text>
      <text x={A.x} y={A.y + 22} textAnchor="middle" fontSize="14" className="svg-ink">
        {labels.A}
      </text>
      <text x={B.x} y={B.y + 22} textAnchor="middle" fontSize="14" className="svg-ink">
        {labels.B}
      </text>
      <text x={F.x + 10} y={F.y + 18} fontSize="14" className="svg-ink">
        {labels.F}
      </text>
      <text x={S.x} y={S.y - 12} textAnchor="middle" fontSize="14" className="svg-ink">
        {labels.S}
      </text>
      <text x={F.x - 14} y={(F.y + S.y) / 2} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontStyle="italic" className="svg-ink">
        {labels.heightLabel}
      </text>
    </svg>
  )
}
