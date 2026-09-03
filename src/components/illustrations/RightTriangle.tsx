import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'rightTriangle' }>, 'caption'>

const PAD = 50
const SCALE = 70

/** Triangle rectangle isolé — angle droit toujours en bas à droite, base horizontale, côté
 * vertical à droite. Sert aux constructions à angles remarquables (45-45-90, 30-60-90). */
export function RightTriangle({ legs, sideLabels, angleLabels }: Props) {
  const w = legs.horizontal * SCALE
  const h = legs.vertical * SCALE
  const width = w + PAD * 2
  const height = h + PAD * 2

  const bottomLeft = { x: PAD, y: PAD + h }
  const bottomRight = { x: PAD + w, y: PAD + h }
  const top = { x: PAD + w, y: PAD }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Triangle rectangle avec côtés et angles étiquetés">
      <polygon
        points={`${bottomLeft.x},${bottomLeft.y} ${bottomRight.x},${bottomRight.y} ${top.x},${top.y}`}
        fill="none"
        className="svg-line"
        strokeWidth="1.8"
      />
      <rect x={bottomRight.x - 10} y={bottomRight.y - 10} width="10" height="10" fill="none" className="svg-line" strokeWidth="1.1" />

      {/* arc d'angle en bas à gauche */}
      <path d={`M${bottomLeft.x + 26},${bottomLeft.y} A26,26 0 0 0 ${bottomLeft.x + 26 * Math.cos(Math.atan2(h, w))},${bottomLeft.y - 26 * Math.sin(Math.atan2(h, w))}`} fill="none" className="svg-accent-outline" strokeWidth="1.4" />
      <text x={bottomLeft.x + 32} y={bottomLeft.y - 12} fontSize="12" className="svg-accent">
        {angleLabels.atLeft}
      </text>

      {/* arc d'angle en haut */}
      <path d={`M${top.x},${top.y + 24} A24,24 0 0 1 ${top.x - 24 * Math.sin(Math.atan2(w, h))},${top.y + 24 * Math.cos(Math.atan2(w, h))}`} fill="none" className="svg-accent-outline" strokeWidth="1.4" />
      <text x={top.x - 8} y={top.y + 36} textAnchor="end" fontSize="12" className="svg-accent">
        {angleLabels.atRight}
      </text>

      <text x={(bottomLeft.x + bottomRight.x) / 2} y={bottomLeft.y + 20} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" className="svg-ink">
        {sideLabels.horizontal}
      </text>
      <text x={bottomRight.x + 16} y={(bottomRight.y + top.y) / 2} fontFamily="IBM Plex Mono, monospace" fontSize="13" className="svg-ink">
        {sideLabels.vertical}
      </text>
      <text
        x={(bottomLeft.x + top.x) / 2 - 10}
        y={(bottomLeft.y + top.y) / 2}
        textAnchor="end"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="13"
        className="svg-ink"
      >
        {sideLabels.hypotenuse}
      </text>
    </svg>
  )
}
