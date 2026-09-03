import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'weightedTree' }>, 'caption'>

const W = 460
const H = 260
const ROOT_X = 40
const LVL1_X = 190
const LVL2_X = 340
const LABEL_X = 400

/** Arbre pondéré à 2 niveaux — disposition toujours identique (racine à gauche, 2 colonnes de
 * branches), seuls le nombre de branches par niveau et leurs étiquettes changent. */
export function WeightedTree({ firstLevel, secondLevel }: Props) {
  const rootY = H / 2
  const n1 = firstLevel.length
  const y1 = firstLevel.map((_, i) => (H / (n1 + 1)) * (i + 1))

  const n2 = secondLevel.length
  const y2 = secondLevel.map((_, i) => (H / (n2 + 1)) * (i + 1))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Arbre pondéré">
      <circle cx={ROOT_X} cy={rootY} r="3" className="svg-ink" />

      {firstLevel.map((b, i) => (
        <g key={i}>
          <line x1={ROOT_X} y1={rootY} x2={LVL1_X} y2={y1[i]} className="svg-line" strokeWidth="1.4" />
          <text x={(ROOT_X + LVL1_X) / 2} y={(rootY + y1[i]) / 2 - 6} textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13">
            {b.prob}
          </text>
          <circle cx={LVL1_X} cy={y1[i]} r="3" className="svg-ink" />
          <text x={LVL1_X + 10} y={y1[i] - 14} className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14">
            {b.label}
          </text>
        </g>
      ))}

      {secondLevel.map((b, i) => (
        <g key={i}>
          <line x1={LVL1_X} y1={y1[b.fromFirst]} x2={LVL2_X} y2={y2[i]} className={b.highlight ? 'svg-accent' : 'svg-line'} strokeWidth={b.highlight ? 2 : 1.4} />
          <text x={LVL1_X + (LVL2_X - LVL1_X) * 0.7} y={y1[b.fromFirst] + (y2[i] - y1[b.fromFirst]) * 0.7 - 6} textAnchor="middle" className={b.highlight ? 'svg-accent' : 'svg-good'} fontFamily="IBM Plex Mono, monospace" fontSize="13">
            {b.prob}
          </text>
          <circle cx={LVL2_X} cy={y2[i]} r="3" className={b.highlight ? 'svg-accent' : 'svg-ink'} />
          <text x={LVL2_X + 10} y={y2[i] - 8} className={b.highlight ? 'svg-accent' : 'svg-ink'} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14">
            {b.label}
          </text>
          {b.pathProb && (
            <text x={LABEL_X} y={y2[i] + 4} className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
              {b.pathProb}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
