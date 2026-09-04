import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'universePartition' }>, 'caption'>

const W = 460
const H = 250
const BOX_X = 22
const BOX_Y = 40
const BOX_W = 416
const BOX_H = 158

/**
 * Univers Ω découpé en bandes verticales (la partition) et TRAVERSÉ par un événement A dessiné
 * en ellipse ombrée : la figure de la loi des probabilités totales, où P(A) est la somme des
 * tranches de A dans chaque morceau.
 */
export function UniversePartition({ parts, universeLabel, eventLabel, formulaLabel }: Props) {
  const stripW = BOX_W / parts.length
  const cx = BOX_X + BOX_W / 2
  const cy = BOX_Y + BOX_H / 2
  const rx = BOX_W / 2 - 16
  const ry = 44

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Partition de l'univers en ${parts.length} morceaux, traversés par l'événement ${eventLabel}`}>
      <rect x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} className="svg-line" fill="none" strokeWidth="1.4" />

      {parts.slice(1).map((_, i) => (
        <line
          key={i}
          x1={BOX_X + (i + 1) * stripW}
          y1={BOX_Y}
          x2={BOX_X + (i + 1) * stripW}
          y2={BOX_Y + BOX_H}
          className="svg-faint"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />
      ))}

      <g className="svg-ink-faint" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="13" textAnchor="middle">
        {parts.map((p, i) => (
          <text key={i} x={BOX_X + (i + 0.5) * stripW} y={BOX_Y - 12}>
            {p}
          </text>
        ))}
      </g>

      <g transform={`rotate(-6 ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--accent)" fillOpacity="0.16" />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="svg-accent-outline" strokeWidth="1.8" />
      </g>
      <text x={cx} y={cy - ry - 8} textAnchor="middle" className="svg-accent" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="14" fontWeight="700">
        {eventLabel}
      </text>

      <text x={BOX_X + 8} y={BOX_Y + BOX_H - 10} className="svg-ink-faint" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="13">
        {universeLabel}
      </text>

      <text x={W / 2} y={H - 14} textAnchor="middle" className="svg-ink-faint" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {formulaLabel}
      </text>
    </svg>
  )
}
