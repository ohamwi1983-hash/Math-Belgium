import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'productAreaSquare' }>, 'caption'>

const W = 320
const H = 320
const LEFT = 60
const RIGHT = 260
const TOP = 30
const BOTTOM = 230
const SIDE = RIGHT - LEFT

/** Carré d'aire 1 : un rectangle teinté de largeur p1 et de hauteur p2 représente le produit p1×p2. */
export function ProductAreaSquare({ p1, p1Label, p2, p2Label, productLabel, axisLabel1, axisLabel2 }: Props) {
  const xP1 = LEFT + p1 * SIDE
  const yP2 = BOTTOM - p2 * SIDE

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Carré d'aire 1, produit de deux probabilités indépendantes">
      <rect x={LEFT} y={TOP} width={SIDE} height={SIDE} fill="none" className="svg-line" strokeWidth="1.5" />
      <rect x={LEFT} y={yP2} width={xP1 - LEFT} height={BOTTOM - yP2} className="svg-band" />

      <line x1={xP1} y1={TOP} x2={xP1} y2={BOTTOM} className="svg-faint" strokeWidth="1.2" strokeDasharray="3 3" />
      <line x1={LEFT} y1={yP2} x2={RIGHT} y2={yP2} className="svg-faint" strokeWidth="1.2" strokeDasharray="3 3" />

      <text x={LEFT} y={BOTTOM + 18} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        0
      </text>
      <text x={xP1} y={BOTTOM + 18} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {p1Label}
      </text>
      <text x={RIGHT} y={BOTTOM + 18} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        1
      </text>

      <text x={LEFT - 8} y={BOTTOM + 4} textAnchor="end" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        0
      </text>
      <text x={LEFT - 8} y={yP2 + 4} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {p2Label}
      </text>
      <text x={LEFT - 8} y={TOP + 4} textAnchor="end" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        1
      </text>

      <text x={(LEFT + xP1) / 2} y={(yP2 + BOTTOM) / 2 + 4} textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight={700}>
        {productLabel}
      </text>

      <text x={(LEFT + RIGHT) / 2} y={H - 8} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {axisLabel1}
      </text>
      <text x="8" y={TOP - 10} className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {axisLabel2}
      </text>
    </svg>
  )
}
