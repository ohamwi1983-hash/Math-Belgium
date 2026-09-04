import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'circularPermutation' }>, 'caption'>

const W = 260
const H = 260
const CX = 130
const CY = 130
const R = 88

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const sx = cx + r * Math.cos((startDeg * Math.PI) / 180)
  const sy = cy - r * Math.sin((startDeg * Math.PI) / 180)
  const ex = cx + r * Math.cos((endDeg * Math.PI) / 180)
  const ey = cy - r * Math.sin((endDeg * Math.PI) / 180)
  const delta = endDeg - startDeg
  const largeArc = Math.abs(delta) > 180 ? 1 : 0
  const sweep = delta > 0 ? 0 : 1
  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 ${largeArc} ${sweep} ${ex.toFixed(1)} ${ey.toFixed(1)}`
}

/**
 * Permutation circulaire : `n` objets distincts en cercle, plus la symétrie qui rend deux
 * dispositions équivalentes — arc de rotation (table) ou axe de réflexion (collier).
 */
export function CircularPermutation({ n, mode, symmetryLabel }: Props) {
  const angleAt = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n
  const pts = Array.from({ length: n }, (_, i) => ({
    x: CX + R * Math.cos(angleAt(i)),
    y: CY + R * Math.sin(angleAt(i)),
  }))
  const label = symmetryLabel ?? (mode === 'rotation' ? 'rotation ≡' : 'réflexion')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${n} objets en cercle, symétrie de ${mode === 'rotation' ? 'rotation' : 'réflexion'}`}>
      <circle cx={CX} cy={CY} r={R} fill="none" className="svg-faint" strokeWidth="1.2" strokeDasharray="5 4" />
      <polygon points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" className="svg-line" strokeWidth="1.3" opacity="0.5" />

      {mode === 'reflection' && (
        <>
          <line x1={CX} y1={CY - R - 24} x2={CX} y2={CY + R + 24} className="svg-good" strokeWidth="2" />
          <text x={CX + 10} y={CY - R - 28} className="svg-good" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="600">
            {label}
          </text>
        </>
      )}

      {mode === 'rotation' && (
        <>
          <path d={arcPath(CX, CY, 34, 80, 10)} fill="none" className="svg-line" strokeWidth="1.4" />
          <text x={CX} y={CY - 42} textAnchor="middle" className="svg-accent" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="600">
            {label}
          </text>
        </>
      )}

      {pts.map((p, i) => (
        <circle key={`n${i}`} cx={p.x} cy={p.y} r="6" fill="var(--surface)" className="svg-line" strokeWidth="1.5" />
      ))}

      {pts.map((_, i) => {
        const lr = R + 20
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
            {i + 1}
          </text>
        )
      })}
    </svg>
  )
}
