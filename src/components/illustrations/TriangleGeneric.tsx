import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'triangleGeneric' }>, 'caption'>

/** Petit arc d'angle au sommet `vertex`, entre les directions vers `p1` et `p2`. */
function vertexArc(vertex: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, radius: number) {
  const a1 = Math.atan2(-(p1.y - vertex.y), p1.x - vertex.x)
  const a2 = Math.atan2(-(p2.y - vertex.y), p2.x - vertex.x)
  const x1 = vertex.x + radius * Math.cos(a1)
  const y1 = vertex.y - radius * Math.sin(a1)
  const x2 = vertex.x + radius * Math.cos(a2)
  const y2 = vertex.y - radius * Math.sin(a2)
  let diff = a2 - a1
  while (diff <= -Math.PI) diff += 2 * Math.PI
  while (diff > Math.PI) diff -= 2 * Math.PI
  const sweep = diff > 0 ? 0 : 1
  return `M${x1.toFixed(1)},${y1.toFixed(1)} A${radius},${radius} 0 0 ${sweep} ${x2.toFixed(1)},${y2.toFixed(1)}`
}

/** Triangle ABC quelconque — base [AB] toujours horizontale (comme dans toutes les sources de ce
 * chapitre), sommets en coordonnées libres. Hauteur, construction en repère et arcs d'angle sont
 * chacun optionnels et se combinent librement. */
export function TriangleGeneric({ A, B, C, angleArcsAt, heightFromC, coordinateConstruction, sideLabels }: Props) {
  const xs = [A.x, B.x, C.x]
  const ys = [A.y, B.y, C.y]
  const minX = Math.min(...xs) - 40
  const maxX = Math.max(...xs) + 40
  const minY = Math.min(...ys) - 30
  const maxY = Math.max(...ys) + 40

  const H = { x: C.x, y: A.y }

  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} role="img" aria-label="Triangle quelconque ABC">
      <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="none" className="svg-line" strokeWidth="1.8" />

      {heightFromC && (
        <>
          <line x1={C.x} y1={C.y} x2={H.x} y2={H.y} className="svg-faint" strokeWidth="1.3" strokeDasharray="4 3" />
          <rect x={H.x - 10} y={H.y - 10} width="10" height="10" fill="none" className="svg-line" strokeWidth="1.1" />
          {heightFromC.footLabel && (
            <text x={H.x + 6} y={H.y + 18} fontSize="12.5" className="svg-ink">
              {heightFromC.footLabel}
            </text>
          )}
          {heightFromC.hLabel && (
            <text x={H.x - 6} y={(H.y + C.y) / 2} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="13" className="svg-ink">
              {heightFromC.hLabel}
            </text>
          )}
        </>
      )}

      {coordinateConstruction && (
        <>
          <rect x={H.x - 10} y={H.y - 10} width="10" height="10" fill="none" className="svg-line" strokeWidth="1.1" />
          <line x1={C.x} y1={C.y} x2={H.x} y2={H.y} className="svg-faint" strokeWidth="1.3" strokeDasharray="4 3" />
          <line x1={A.x} y1={A.y + 8} x2={A.x} y2={A.y + 14} className="svg-faint" strokeWidth="1.1" />
          <line x1={H.x} y1={H.y + 8} x2={H.x} y2={H.y + 14} className="svg-faint" strokeWidth="1.1" />
          <line x1={A.x} y1={A.y + 11} x2={H.x} y2={H.y + 11} className="svg-faint" strokeWidth="1.1" />
          <text x={(A.x + H.x) / 2} y={A.y + 28} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12.5" className="svg-ink">
            {coordinateConstruction.horizontalLabel}
          </text>
          <text x={H.x + 8} y={(H.y + C.y) / 2} fontFamily="IBM Plex Mono, monospace" fontSize="12.5" className="svg-ink">
            {coordinateConstruction.verticalLabel}
          </text>
        </>
      )}

      {angleArcsAt?.includes('A') && <path d={vertexArc(A, B, C, 26)} fill="none" className="svg-accent-outline" strokeWidth="1.4" />}
      {angleArcsAt?.includes('B') && <path d={vertexArc(B, A, C, 26)} fill="none" className="svg-accent-outline" strokeWidth="1.4" />}
      {angleArcsAt?.includes('C') && <path d={vertexArc(C, A, B, 24)} fill="none" className="svg-accent-outline" strokeWidth="1.4" />}

      <text x={A.x - 14} y={A.y + 6} fontSize="14" className="svg-ink">A</text>
      <text x={B.x + 10} y={B.y + 6} fontSize="14" className="svg-ink">B</text>
      <text x={C.x} y={C.y - 12} textAnchor="middle" fontSize="14" className="svg-ink">C</text>

      {sideLabels?.c && (
        <text x={(A.x + B.x) / 2} y={A.y + 20} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontStyle="italic" className="svg-ink">
          {sideLabels.c}
        </text>
      )}
      {sideLabels?.a && (
        <text x={(B.x + C.x) / 2 + 10} y={(B.y + C.y) / 2} fontFamily="IBM Plex Mono, monospace" fontSize="13" fontStyle="italic" className="svg-ink">
          {sideLabels.a}
        </text>
      )}
      {sideLabels?.b && (
        <text x={(A.x + C.x) / 2 - 10} y={(A.y + C.y) / 2} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontStyle="italic" className="svg-ink">
          {sideLabels.b}
        </text>
      )}
    </svg>
  )
}
