import { useId } from 'react'
import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'sequencePlot' }>, 'caption'>

const X_LEFT = 55
const X_RIGHT = 510
const Y_TOP = 20
const Y_BOTTOM = 200

/** Points discrets d'une suite (n, valeur) — chaque terme est un point isolé, pas une courbe
 * continue échantillonnée. Le connecteur (lissé ou droit) est purement visuel, jamais une vraie
 * fonction interpolée. */
export function SequencePlot({ points, connector = 'straight', stepIndicator, referenceLine, trendLabel, highlightPoint, yTicks, xAxisLabel, yAxisLabel }: Props) {
  const markerId = `sp-arrow-${useId()}`
  const ns = points.map((p) => p.n)
  const values = points.map((p) => p.value)
  const nMin = Math.min(...ns)
  const nMax = Math.max(...ns)
  const vMin = Math.min(...values, referenceLine?.value ?? Infinity, 0)
  const vMax = Math.max(...values, referenceLine?.value ?? -Infinity, 0)
  const vSpan = vMax - vMin || 1

  const xScale = (n: number) => X_LEFT + ((n - nMin) / (nMax - nMin || 1)) * (X_RIGHT - X_LEFT)
  const yScale = (v: number) => Y_BOTTOM - ((v - vMin) / vSpan) * (Y_BOTTOM - Y_TOP) * 0.88 - (Y_BOTTOM - Y_TOP) * 0.02

  const coords = points.map((p) => ({ ...p, x: xScale(p.n), y: yScale(p.value) }))

  // Courbe lissée façon Catmull-Rom → Bézier cubique, purement visuelle (pas une interpolation
  // mathématique de la suite, qui n'est définie qu'aux entiers).
  let connectorPath = ''
  if (connector !== 'none' && coords.length > 1) {
    if (connector === 'straight') {
      connectorPath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
    } else {
      const pts = coords
      connectorPath = `M${pts[0].x},${pts[0].y} `
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = pts[Math.min(pts.length - 1, i + 2)]
        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6
        connectorPath += `C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `
      }
    }
  }

  const zeroY = yScale(0)

  return (
    <svg viewBox="0 0 540 240" role="img" aria-label="Points d'une suite">
      <line x1={X_LEFT} y1={zeroY} x2={X_RIGHT + 8} y2={zeroY} className="svg-line" strokeWidth="1.5" markerEnd={`url(#${markerId})`} />
      <line x1={X_LEFT} y1={Y_BOTTOM} x2={X_LEFT} y2={Y_TOP - 8} className="svg-line" strokeWidth="1.5" markerEnd={`url(#${markerId})`} />
      <text x={X_RIGHT} y={Y_BOTTOM + 32} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {xAxisLabel}
      </text>
      <text x={X_LEFT - 8} y={Y_TOP - 4} textAnchor="start" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {yAxisLabel}
      </text>

      {referenceLine &&
        (() => {
          const refY = yScale(referenceLine.value)
          const lastY = coords[coords.length - 1]?.y
          // Le label du dernier point (au-dessus de son point, x proche de X_RIGHT) et celui de la
          // ligne de référence (juste à droite, x=X_RIGHT+6) ne se croisent que si leurs valeurs
          // sont proches — dans ce cas seulement, on écarte le label de la référence vers le bas.
          const labelOffset = lastY !== undefined && Math.abs(refY - lastY) < 16 ? 20 : 4
          return (
            <>
              <line x1={X_LEFT} y1={refY} x2={X_RIGHT} y2={refY} className="svg-good" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={X_RIGHT + 6} y={refY + labelOffset} className="svg-good" fontFamily="IBM Plex Mono, monospace" fontSize="12">
                {referenceLine.label}
              </text>
            </>
          )
        })()}

      {connectorPath && <path d={connectorPath} fill="none" style={{ fill: 'none' }} className="svg-accent-outline" strokeWidth="1.6" strokeDasharray="3 3" />}

      {stepIndicator &&
        (() => {
          const a = coords[stepIndicator.fromIndex]
          const b = coords[stepIndicator.toIndex]
          if (!a || !b) return null
          return (
            <>
              <line x1={a.x} y1={a.y} x2={a.x} y2={b.y} className="svg-good" strokeWidth="2" />
              <line x1={a.x} y1={b.y} x2={b.x} y2={b.y} className="svg-good" strokeWidth="2" />
              <text x={(a.x + b.x) / 2} y={b.y - 8} textAnchor="middle" className="svg-good" fontFamily="IBM Plex Mono, monospace" fontSize="11">
                {stepIndicator.label}
              </text>
            </>
          )
        })()}

      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="5" className="svg-accent" />
      ))}
      <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11" textAnchor="middle">
        {coords.map((c, i) => (
          <text key={i} x={c.x} y={Y_BOTTOM + 16}>
            {c.n}
          </text>
        ))}
      </g>
      {yTicks && (
        <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11" textAnchor="end">
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={X_LEFT - 4} y1={yScale(t)} x2={X_RIGHT} y2={yScale(t)} className="svg-faint" strokeWidth="1" strokeDasharray="3 3" />
              <text x={X_LEFT - 8} y={yScale(t) + 4}>
                {t}
              </text>
            </g>
          ))}
        </g>
      )}
      <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11" textAnchor="middle">
        {coords.map((c, i) => (
          <text key={i} x={c.x} y={c.y - 10}>
            {c.label}
          </text>
        ))}
      </g>

      {highlightPoint &&
        coords[highlightPoint.index] &&
        (() => {
          const c = coords[highlightPoint.index]
          return (
            <g>
              <line x1={c.x} y1={c.y} x2={c.x} y2={Y_BOTTOM} className="svg-faint" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1={X_LEFT} y1={c.y} x2={c.x} y2={c.y} className="svg-faint" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx={c.x} cy={c.y} r="5" className="svg-bad" />
              {highlightPoint.xLabel && (
                <text x={c.x} y={Y_BOTTOM + 16} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700">
                  {highlightPoint.xLabel}
                </text>
              )}
              {highlightPoint.yLabel && (
                <text x={X_LEFT - 8} y={c.y + 4} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700">
                  {highlightPoint.yLabel}
                </text>
              )}
            </g>
          )
        })()}

      {trendLabel &&
        coords[trendLabel.afterIndex] && (
          <text x={coords[trendLabel.afterIndex].x} y={coords[trendLabel.afterIndex].y - 22} textAnchor="middle" className="svg-good" fontFamily="IBM Plex Mono, monospace" fontSize="10">
            {trendLabel.text}
          </text>
        )}

      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  )
}
