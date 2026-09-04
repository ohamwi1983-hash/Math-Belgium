import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'solidRevolution' }>, 'caption'>

const W = 210
const H = 170
const AXIS_Y = 85
const PX_START = 32
const PX_END = 178
const SCALE = 18
const SQUASH = 0.34

/**
 * Solide de révolution en coupe « 3D » (cône plein ou paroi creuse en rondelle), pour rendre
 * visible la forme réellement engendrée par une rotation — un diagramme `curvePlot` de la région
 * plane, seul, laisse croire à tort que le solide EST cette région plate.
 */
export function SolidRevolution({ variant, outerRadius, startLabel, endLabel, midLabel }: Props) {
  const rEnd = outerRadius * SCALE
  const rxEnd = SQUASH * rEnd
  const xMid = PX_START + 0.5 * (PX_END - PX_START)
  const rMid = 0.5 * rEnd
  const rxMid = SQUASH * rMid

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={variant === 'cone' ? 'Cône plein engendré par la rotation' : 'Paroi creuse engendrée par la rotation (méthode des rondelles)'}
    >
      <line x1={PX_START - 14} y1={AXIS_Y} x2={PX_END + 14} y2={AXIS_Y} className="svg-faint" strokeWidth="1" strokeDasharray="3 3" />

      {variant === 'cone' ? (
        <>
          <polygon points={`${PX_START},${AXIS_Y} ${PX_END},${AXIS_Y - rEnd} ${PX_END},${AXIS_Y + rEnd}`} className="svg-band" />
          <line x1={PX_START} y1={AXIS_Y} x2={PX_END} y2={AXIS_Y - rEnd} className="svg-accent-outline" strokeWidth="2" />
          <line x1={PX_START} y1={AXIS_Y} x2={PX_END} y2={AXIS_Y + rEnd} className="svg-accent-outline" strokeWidth="2" />
          <circle cx={PX_START} cy={AXIS_Y} r="2.6" className="svg-accent" />
          <ellipse cx={xMid} cy={AXIS_Y} rx={rxMid} ry={rMid} fill="none" className="svg-faint" strokeWidth="1" strokeDasharray="3 3" />
        </>
      ) : (
        <>
          <polygon points={`${PX_START},${AXIS_Y - rEnd} ${PX_END},${AXIS_Y - rEnd} ${PX_START},${AXIS_Y}`} className="svg-band" />
          <polygon points={`${PX_START},${AXIS_Y + rEnd} ${PX_END},${AXIS_Y + rEnd} ${PX_START},${AXIS_Y}`} className="svg-band" />
          <line x1={PX_START} y1={AXIS_Y - rEnd} x2={PX_END} y2={AXIS_Y - rEnd} className="svg-accent-outline" strokeWidth="2" />
          <line x1={PX_START} y1={AXIS_Y + rEnd} x2={PX_END} y2={AXIS_Y + rEnd} className="svg-accent-outline" strokeWidth="2" />
          <line x1={PX_START} y1={AXIS_Y} x2={PX_END} y2={AXIS_Y - rEnd} fill="none" className="svg-faint" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={PX_START} y1={AXIS_Y} x2={PX_END} y2={AXIS_Y + rEnd} fill="none" className="svg-faint" strokeWidth="1" strokeDasharray="3 3" />
          <ellipse cx={PX_START} cy={AXIS_Y} rx={rxEnd} ry={rEnd} fill="var(--accent)" opacity="0.24" className="svg-line" strokeWidth="1.5" />
          <ellipse cx={xMid} cy={AXIS_Y} rx={rxEnd} ry={rEnd} fill="none" className="svg-faint" strokeWidth="1" strokeDasharray="3 3" />
          <ellipse cx={xMid} cy={AXIS_Y} rx={rxMid} ry={rMid} fill="none" className="svg-faint" strokeWidth="1" strokeDasharray="3 3" />
        </>
      )}

      <ellipse cx={PX_END} cy={AXIS_Y} rx={rxEnd} ry={rEnd} fill={variant === 'cone' ? 'var(--surface)' : 'none'} className="svg-line" strokeWidth="1.5" />

      <g fontFamily="IBM Plex Mono, monospace" fontSize="10.5" className="svg-ink-faint">
        <text x={PX_START} y={AXIS_Y + rEnd + 20} textAnchor="middle">
          {startLabel}
        </text>
        <text x={PX_END} y={AXIS_Y + rEnd + 20} textAnchor="middle">
          {endLabel}
        </text>
      </g>
      <text
        x={xMid}
        y={AXIS_Y - rMid - 8}
        textAnchor="middle"
        className="svg-accent"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        fontWeight="600"
      >
        {midLabel}
      </text>
    </svg>
  )
}
