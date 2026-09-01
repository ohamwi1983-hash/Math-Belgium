import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'circleDiagram' }>, 'caption'>

const SIZE = 300
const CX = 150
const CY = 150
const R = 100

function polygonPoints(n: number, radius: number, rotation: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = rotation + (i * 2 * Math.PI) / n
    return [CX + radius * Math.cos(a), CY - radius * Math.sin(a)] as [number, number]
  })
}

/**
 * Cercle + secteur/segment/corde/polygone(s) — schéma géométrique générique, configurable plutôt
 * qu'un composant par variante. Positions calculées, pas pixel-figées : structurellement fidèle à
 * la source, sans reproduire chaque étiquette au pixel près.
 */
export function CircleDiagram({
  startAngle = 0,
  sectorAngle,
  highlight,
  showChord,
  inscribedPolygon,
  circumscribedPolygon,
  groundLine,
  markedPoint,
  centerLabel,
  radiusLabel,
  pointALabel,
  pointBLabel,
  angleLabel,
}: Props) {
  const endAngle = sectorAngle !== undefined ? startAngle + sectorAngle : undefined
  const ptA: [number, number] | undefined = sectorAngle !== undefined ? [CX + R * Math.cos(startAngle), CY - R * Math.sin(startAngle)] : undefined
  const ptB: [number, number] | undefined = endAngle !== undefined ? [CX + R * Math.cos(endAngle), CY - R * Math.sin(endAngle)] : undefined

  const largeArc = sectorAngle !== undefined && sectorAngle > Math.PI ? 1 : 0
  const arcPath = ptA && ptB ? `M${ptA[0]},${ptA[1]} A${R},${R} 0 ${largeArc} 0 ${ptB[0]},${ptB[1]}` : ''

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Diagramme de cercle">
      <circle cx={CX} cy={CY} r={R} fill="none" className="svg-faint" strokeWidth="1.5" />

      {circumscribedPolygon &&
        (() => {
          const rOut = R / Math.cos(Math.PI / circumscribedPolygon)
          const pts = polygonPoints(circumscribedPolygon, rOut, Math.PI / circumscribedPolygon)
          return <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="none" className="svg-line" strokeWidth="1.3" />
        })()}
      {inscribedPolygon &&
        (() => {
          const pts = polygonPoints(inscribedPolygon, R, Math.PI / inscribedPolygon)
          return <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="none" className="svg-line" strokeWidth="1.5" />
        })()}

      {groundLine && <line x1={CX - R - 40} y1={CY + R} x2={CX + R + 40} y2={CY + R} className="svg-line" strokeWidth="2" />}

      {ptA && ptB && (
        <>
          {highlight === 'sector' && (
            <path d={`M${CX},${CY} L${ptA[0]},${ptA[1]} A${R},${R} 0 ${largeArc} 0 ${ptB[0]},${ptB[1]} Z`} fill="none" className="svg-accent-outline" strokeWidth="2" />
          )}
          {highlight !== 'sector' && (
            <>
              <line x1={CX} y1={CY} x2={ptA[0]} y2={ptA[1]} className="svg-accent-outline" strokeWidth="2" />
              <line x1={CX} y1={CY} x2={ptB[0]} y2={ptB[1]} className="svg-accent-outline" strokeWidth="2" />
            </>
          )}
          {(highlight === 'arc' || highlight === 'segment') && <path d={arcPath} fill="none" className="svg-good" style={{ fill: 'none' }} strokeWidth="3" />}
          {(showChord || highlight === 'segment') && (
            <line x1={ptA[0]} y1={ptA[1]} x2={ptB[0]} y2={ptB[1]} className="svg-line" strokeWidth="1.5" strokeDasharray={highlight === 'segment' ? undefined : '4 3'} />
          )}
          <circle cx={ptA[0]} cy={ptA[1]} r="2.5" className="svg-ink" />
          <circle cx={ptB[0]} cy={ptB[1]} r="2.5" className="svg-ink" />
          {pointALabel && (
            <text x={ptA[0] + (ptA[0] > CX ? 10 : -10)} y={ptA[1]} textAnchor={ptA[0] > CX ? 'start' : 'end'} className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="13">
              {pointALabel}
            </text>
          )}
          {pointBLabel && (
            <text x={ptB[0] + (ptB[0] > CX ? 10 : -10)} y={ptB[1]} textAnchor={ptB[0] > CX ? 'start' : 'end'} className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="13">
              {pointBLabel}
            </text>
          )}
          {angleLabel &&
            (() => {
              const mid = startAngle + (sectorAngle ?? 0) / 2
              const lx = CX + 28 * Math.cos(mid)
              const ly = CY - 28 * Math.sin(mid)
              return (
                <text x={lx} y={ly} textAnchor="middle" className="svg-accent" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14">
                  {angleLabel}
                </text>
              )
            })()}
          {radiusLabel && (
            <text
              x={CX + (R / 2) * Math.cos(startAngle) + 10 * Math.sin(startAngle)}
              y={CY - (R / 2) * Math.sin(startAngle) + 10 * Math.cos(startAngle)}
              textAnchor="middle"
              className="svg-ink"
              fontFamily="Fraunces, serif"
              fontStyle="italic"
              fontSize="14"
            >
              {radiusLabel}
            </text>
          )}
        </>
      )}

      {markedPoint &&
        (() => {
          const mx = CX + R * Math.cos(markedPoint.angle)
          const my = CY - R * Math.sin(markedPoint.angle)
          return (
            <>
              <line x1={CX} y1={CY} x2={mx} y2={my} className="svg-faint" strokeWidth="1.3" strokeDasharray="2 3" />
              <circle cx={mx} cy={my} r="5" className="svg-accent" />
              {markedPoint.label && (
                <text x={mx} y={my + (my > CY ? 20 : -14)} textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="12">
                  {markedPoint.label}
                </text>
              )}
            </>
          )
        })()}

      <circle cx={CX} cy={CY} r="2.5" className="svg-ink" />
      {centerLabel && (
        <text x={CX - 10} y={CY + 16} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
          {centerLabel}
        </text>
      )}
    </svg>
  )
}
