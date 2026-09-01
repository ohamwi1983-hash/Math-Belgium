import { useId } from 'react'
import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'circleAngles' }>, 'caption'>

const SIZE = 300
const CX = 150
const CY = 150
const R = 100

const TONE_CLASS: Record<'accent' | 'good' | 'bad', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
}

/** Place 1 ou 2 points sur le cercle trigonométrique par leur angle, avec accessoires optionnels
 * (corde/sécante étendue, projections sur les axes, ligne horizontale de référence). */
export function CircleAngles({ points, connectPoints, projectToXAxis, projectToYAxis, horizontalLine, verticalLine }: Props) {
  const markerId = `ca-arrow-${useId()}`
  const coords = points.map((p) => ({ ...p, x: CX + R * Math.cos(p.angle), y: CY - R * Math.sin(p.angle) }))

  // Droite étendue aux bords du cadre passant par les deux points (pas juste le segment) — sert
  // de corde pour sin/cos, et de sécante prolongée jusqu'à la tangente pour tan.
  let extendedLine: { x1: number; y1: number; x2: number; y2: number } | null = null
  if (connectPoints && coords.length === 2) {
    const [p, q] = coords
    const dx = q.x - p.x
    const dy = q.y - p.y
    const t = 1000
    extendedLine = { x1: p.x - t * dx, y1: p.y - t * dy, x2: q.x + t * dx, y2: q.y + t * dy }
  }

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Points sur le cercle trigonométrique">
      <defs>
        <clipPath id={`clip-${markerId}`}>
          <rect x="0" y="0" width={SIZE} height={SIZE} />
        </clipPath>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>

      <g clipPath={`url(#clip-${markerId})`}>
        <line x1={CX - R - 20} y1={CY} x2={CX + R + 20} y2={CY} className="svg-line" strokeWidth="1.3" markerEnd={`url(#${markerId})`} />
        <line x1={CX} y1={CY - R - 20} x2={CX} y2={CY + R + 20} className="svg-line" strokeWidth="1.3" markerEnd={`url(#${markerId})`} />
        <circle cx={CX} cy={CY} r={R} fill="none" className="svg-line" strokeWidth="1.5" />

        {horizontalLine && (
          <line x1={CX - R - 20} y1={CY - R * horizontalLine.y} x2={CX + R + 20} y2={CY - R * horizontalLine.y} className="svg-faint" strokeWidth="1.3" strokeDasharray="3 3" />
        )}
        {verticalLine && (
          <line x1={CX + R * verticalLine.x} y1={CY - R - 20} x2={CX + R * verticalLine.x} y2={CY + R + 20} className="svg-faint" strokeWidth="1.3" strokeDasharray="3 3" />
        )}

        {extendedLine && <line {...extendedLine} className="svg-accent" strokeWidth="1.5" />}

        {coords.map((p, i) => (
          <g key={i}>
            <line x1={CX} y1={CY} x2={p.x} y2={p.y} className={TONE_CLASS[p.tone]} strokeWidth="2" />
            {projectToXAxis && <line x1={p.x} y1={p.y} x2={p.x} y2={CY} className="svg-faint" strokeWidth="1" strokeDasharray="2 3" />}
            {projectToYAxis && <line x1={p.x} y1={p.y} x2={CX} y2={p.y} className="svg-faint" strokeWidth="1" strokeDasharray="2 3" />}
            <circle cx={p.x} cy={p.y} r="4" className={TONE_CLASS[p.tone]} />
          </g>
        ))}
      </g>

      {coords.map((p, i) => (
        <text
          key={i}
          x={p.x + (p.x > CX ? 10 : -10)}
          y={p.y + (p.y > CY ? 14 : -8)}
          textAnchor={p.x > CX ? 'start' : 'end'}
          className={TONE_CLASS[p.tone]}
          fontFamily="Fraunces, serif"
          fontStyle="italic"
          fontSize="14"
        >
          {p.label}
        </text>
      ))}
      {horizontalLine && (
        <text
          x={CX - R + 15}
          y={CY - R * horizontalLine.y - 20}
          textAnchor="end"
          className="svg-ink"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="12"
        >
          {horizontalLine.label}
        </text>
      )}
      {verticalLine && (
        <text x={CX + R * verticalLine.x + 6} y={CY - R - 10} className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
          {verticalLine.label}
        </text>
      )}
      <circle cx={CX} cy={CY} r="2.5" className="svg-ink" />
    </svg>
  )
}
