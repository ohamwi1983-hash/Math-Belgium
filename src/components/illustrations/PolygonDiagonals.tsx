import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'polygonDiagonals' }>, 'caption'>

const W = 360
const H = 360
const CX = 180
const CY = 168
const R = 128

/**
 * Polygone convexe régulier avec TOUTES ses diagonales — les côtés en trait plein, les diagonales
 * en trait fin. Les diagonales sont énumérées (toutes les paires de sommets non consécutifs), pas
 * dessinées à la main : le compte affiché reste donc toujours cohérent avec la figure.
 */
export function PolygonDiagonals({ sides, vertexLabels, summaryLabel }: Props) {
  const angleAt = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / sides
  const pts = Array.from({ length: sides }, (_, i) => ({
    x: CX + R * Math.cos(angleAt(i)),
    y: CY + R * Math.sin(angleAt(i)),
  }))

  const diagonals: { a: number; b: number }[] = []
  for (let i = 0; i < sides; i++) {
    for (let j = i + 1; j < sides; j++) {
      const isSide = j - i === 1 || (i === 0 && j === sides - 1)
      if (!isSide) diagonals.push({ a: i, b: j })
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Polygone à ${sides} côtés et toutes ses diagonales`}>
      {diagonals.map((d, i) => (
        <line
          key={`d${i}`}
          x1={pts[d.a].x}
          y1={pts[d.a].y}
          x2={pts[d.b].x}
          y2={pts[d.b].y}
          className="svg-accent"
          strokeWidth="0.9"
          opacity="0.5"
        />
      ))}

      {pts.map((p, i) => {
        const q = pts[(i + 1) % sides]
        return <line key={`s${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="svg-accent" strokeWidth="2.2" />
      })}

      {pts.map((p, i) => (
        <circle key={`v${i}`} cx={p.x} cy={p.y} r="5" fill="var(--surface)" className="svg-line" strokeWidth="1.4" />
      ))}

      {pts.map((_, i) => {
        const lr = R + 22
        return (
          <text
            key={`l${i}`}
            x={CX + lr * Math.cos(angleAt(i))}
            y={CY + lr * Math.sin(angleAt(i)) + 4}
            textAnchor="middle"
            className="svg-ink"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="12"
          >
            {vertexLabels?.[i] ?? i + 1}
          </text>
        )
      })}

      {summaryLabel && (
        <text x={CX} y={H - 10} textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600" stroke="none">
          {summaryLabel}
        </text>
      )}
    </svg>
  )
}
