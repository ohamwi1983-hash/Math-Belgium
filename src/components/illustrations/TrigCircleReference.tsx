import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'trigCircleReference' }>, 'caption'>

const SIZE = 320
const CX = 160
const CY = 160
const R = 110

/** Cercle gradué avec plusieurs rayons tracés à des angles remarquables, chacun étiqueté. */
export function TrigCircleReference({ angles }: Props) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Cercle trigonométrique gradué avec les angles remarquables">
      <line x1={CX - R - 20} y1={CY} x2={CX + R + 20} y2={CY} className="svg-line" strokeWidth="1.3" />
      <line x1={CX} y1={CY - R - 20} x2={CX} y2={CY + R + 20} className="svg-line" strokeWidth="1.3" />
      <circle cx={CX} cy={CY} r={R} fill="none" className="svg-line" strokeWidth="1.5" />

      {angles.map((a, i) => {
        const x = CX + R * Math.cos(a.value)
        const y = CY - R * Math.sin(a.value)
        const lx = CX + (R + 22) * Math.cos(a.value)
        const ly = CY - (R + 22) * Math.sin(a.value)
        return (
          <g key={i}>
            <line x1={CX} y1={CY} x2={x} y2={y} className="svg-faint" strokeWidth="1" />
            <circle cx={x} cy={y} r="2.5" className="svg-accent" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="11">
              {a.label}
            </text>
          </g>
        )
      })}
      <circle cx={CX} cy={CY} r="2" className="svg-ink" />
    </svg>
  )
}
