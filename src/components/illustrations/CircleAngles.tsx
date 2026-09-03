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

const TONE_OUTLINE_CLASS: Record<'accent' | 'good' | 'bad', string> = {
  accent: 'svg-accent-outline',
  good: 'svg-good-outline',
  bad: 'svg-bad-outline',
}

const LABEL_TONE_CLASS: Record<'accent' | 'good' | 'bad' | 'ink', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  ink: 'svg-ink',
}

/** Place 1 ou 2 points sur le cercle trigonométrique par leur angle, avec accessoires optionnels
 * (corde/sécante étendue, projections sur les axes, ligne horizontale de référence, quadrants,
 * arcs d'angle avec flèche de sens, étiquettes libres, construction de la tangente). */
export function CircleAngles({
  points,
  connectPoints,
  projectToXAxis,
  projectToYAxis,
  horizontalLine,
  verticalLine,
  showQuadrants,
  angleArcs,
  freeLabels,
  rightAngleMarkers,
  tangentConstruction,
}: Props) {
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

  // Arc SVG entre deux angles (radians, sens direct=math standard). Toujours le petit côté du
  // balayage sauf si l'écart dépasse π (grand arc). sweep=0 pour une rotation visuellement directe.
  const arcPath = (from: number, to: number, radius: number) => {
    const x1 = CX + radius * Math.cos(from)
    const y1 = CY - radius * Math.sin(from)
    const x2 = CX + radius * Math.cos(to)
    const y2 = CY - radius * Math.sin(to)
    const large = Math.abs(to - from) > Math.PI ? 1 : 0
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${radius},${radius} 0 ${large} 0 ${x2.toFixed(1)},${y2.toFixed(1)}`
  }

  const toPx = (x: number, y: number) => ({ x: CX + x * R, y: CY - y * R })

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Points sur le cercle trigonométrique">
      <defs>
        <clipPath id={`clip-${markerId}`}>
          <rect x="0" y="0" width={SIZE} height={SIZE} />
        </clipPath>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
        <marker id={`${markerId}-accent`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" className="svg-accent" fill="currentColor" />
        </marker>
      </defs>

      {showQuadrants && (
        <g className="svg-quadrant" fontFamily="Fraunces, serif" fontSize="14" textAnchor="middle">
          <text x={CX + R * 0.55} y={CY - R * 0.55}>I</text>
          <text x={CX - R * 0.55} y={CY - R * 0.55}>II</text>
          <text x={CX - R * 0.55} y={CY + R * 0.6}>III</text>
          <text x={CX + R * 0.55} y={CY + R * 0.6}>IV</text>
        </g>
      )}

      <g clipPath={`url(#clip-${markerId})`}>
        <line x1={CX - R - 20} y1={CY} x2={CX + R + 20} y2={CY} className="svg-line" strokeWidth="1.3" markerEnd={`url(#${markerId})`} />
        <line x1={CX} y1={CY + R + 20} x2={CX} y2={CY - R - 20} className="svg-line" strokeWidth="1.3" markerEnd={`url(#${markerId})`} />
        <circle cx={CX} cy={CY} r={R} fill="none" className="svg-line" strokeWidth="1.5" />

        {tangentConstruction &&
          (() => {
            const a = tangentConstruction.angle
            const tanVal = Math.tan(a)
            const py = CY - R * tanVal
            return (
              <>
                <line x1={CX + R} y1={CY - R - 15} x2={CX + R} y2={CY + R + 15} className="svg-line" strokeWidth="1.3" />
                <line x1={CX} y1={CY} x2={CX + R} y2={py} className="svg-good" strokeWidth="2.2" />
                <circle cx={CX + R} cy={py} r="4" className="svg-good" />
                <rect x={CX + R - 9} y={py < CY ? CY - 9 : CY} width="9" height="9" fill="none" className="svg-line" strokeWidth="1" />
                {tangentConstruction.label && (
                  <text x={CX + R + 6} y={py - 6} className="svg-good" fontFamily="IBM Plex Mono, monospace" fontSize="12">
                    {tangentConstruction.label}
                  </text>
                )}
              </>
            )
          })()}

        {horizontalLine && (
          <line x1={CX - R - 20} y1={CY - R * horizontalLine.y} x2={CX + R + 20} y2={CY - R * horizontalLine.y} className="svg-faint" strokeWidth="1.3" strokeDasharray="3 3" />
        )}
        {verticalLine && (
          <line x1={CX + R * verticalLine.x} y1={CY - R - 20} x2={CX + R * verticalLine.x} y2={CY + R + 20} className="svg-faint" strokeWidth="1.3" strokeDasharray="3 3" />
        )}

        {extendedLine && <line {...extendedLine} className="svg-accent" strokeWidth="1.5" />}

        {angleArcs?.map((a, i) => (
          <g key={i}>
            <path d={arcPath(a.from, a.to, a.radiusPx)} fill="none" className={TONE_OUTLINE_CLASS[a.tone]} strokeWidth="1.5" markerEnd={a.arrow ? `url(#${markerId}-accent)` : undefined} />
            {a.label &&
              (() => {
                const mid = (a.from + a.to) / 2
                const lx = CX + (a.radiusPx + 14) * Math.cos(mid)
                const ly = CY - (a.radiusPx + 14) * Math.sin(mid)
                return (
                  <text x={lx} y={ly} textAnchor="middle" className={TONE_CLASS[a.tone]} fontFamily="IBM Plex Mono, monospace" fontSize="11.5" fontStyle="italic">
                    {a.label}
                  </text>
                )
              })()}
          </g>
        ))}

        {rightAngleMarkers?.map((m, i) => {
          const p = toPx(m.x, m.y)
          const sx = m.x >= 0 ? -9 : 0
          const sy = m.y >= 0 ? 0 : -9
          return <rect key={i} x={p.x + sx} y={p.y + sy} width="9" height="9" fill="none" className="svg-line" strokeWidth="1" />
        })}

        {coords.map((p, i) => (
          <g key={i}>
            <line x1={CX} y1={CY} x2={p.x} y2={p.y} className={TONE_CLASS[p.tone]} strokeWidth="2" strokeDasharray={p.dashed ? '5 3' : undefined} />
            {projectToXAxis && <line x1={p.x} y1={p.y} x2={p.x} y2={CY} className="svg-faint" strokeWidth="1" strokeDasharray="2 3" />}
            {projectToYAxis && <line x1={p.x} y1={p.y} x2={CX} y2={p.y} className="svg-faint" strokeWidth="1" strokeDasharray="2 3" />}
            <circle cx={p.x} cy={p.y} r="4" className={TONE_CLASS[p.tone]} />
          </g>
        ))}
      </g>

      {freeLabels?.map((l, i) => {
        const p = toPx(l.x, l.y)
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" className={LABEL_TONE_CLASS[l.tone ?? 'ink']} fontFamily="IBM Plex Mono, monospace" fontSize="12.5">
            {l.text}
          </text>
        )
      })}

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
