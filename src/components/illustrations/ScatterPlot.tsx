import { useId } from 'react'
import type { IllustrationSpec } from '../../content/types'
import { mathLabelTspans } from './mathLabel'

type Props = Omit<Extract<IllustrationSpec, { kind: 'scatterPlot' }>, 'caption'>

// Deux formats, comme `CurvePlot` : large (nuage pleine largeur) et compact (petits nuages côte à
// côte dans un `illustrationGroup`, ≈ 1,2 : 1).
const WIDE = { w: 640, h: 330, left: 74, right: 612, top: 22, bottom: 284 }
const COMPACT = { w: 320, h: 270, left: 46, right: 304, top: 20, bottom: 226 }

/** Graduation à la française : « − » typographique, virgule décimale. */
function nombreTick(t: number): string {
  return String(t).replace('-', '−').replace('.', ',')
}

const POINT_CLASS: Record<'accent' | 'good' | 'bad' | 'faint', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  faint: 'svg-ink-faint',
}

const LINE_CLASS: Record<'accent' | 'good' | 'bad' | 'faint', string> = {
  accent: 'svg-accent-outline',
  good: 'svg-good-outline',
  bad: 'svg-bad-outline',
  faint: 'svg-line',
}

const TEXT_CLASS: Record<'accent' | 'good' | 'bad' | 'faint' | 'ink', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  faint: 'svg-ink-faint',
  ink: 'svg-ink',
}

const MARK_CLASS: Record<'accent' | 'good' | 'bad' | 'ink', string> = {
  accent: 'svg-accent-outline',
  good: 'svg-good-outline',
  bad: 'svg-bad-outline',
  ink: 'svg-ink-stroke',
}

const MARK_FILL_CLASS: Record<'accent' | 'good' | 'bad' | 'ink', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  ink: 'svg-ink',
}

/**
 * Nuage de points d'une série à deux variables. Axes au bord gauche et au bord bas du cadre (un
 * nuage statistique ne contient presque jamais l'origine), brisure d'axe quand l'axe ne commence pas
 * à 0. Toutes les grandeurs sont en coordonnées de la série ; seuls les carrés des écarts sont
 * construits en pixels (côté = longueur à l'écran de l'écart vertical), pour être de VRAIS carrés.
 */
export function ScatterPlot({
  points,
  xMin,
  xMax,
  yMin,
  yMax,
  xTicks,
  yTicks,
  xTickLabels,
  yTickLabels,
  xAxisLabel,
  yAxisLabel,
  grid = false,
  lines,
  marks,
  residuals,
  quadrants,
  bands,
  compact = false,
}: Props) {
  const arrowId = `scatter-arrow-${useId()}`
  const F = compact ? COMPACT : WIDE
  const fs = compact ? 12 : 13
  const px = (x: number) => F.left + ((x - xMin) / (xMax - xMin)) * (F.right - F.left)
  const py = (y: number) => F.bottom - ((y - yMin) / (yMax - yMin)) * (F.bottom - F.top)
  const clampY = (y: number) => Math.max(yMin, Math.min(yMax, y))

  // Tronçon d'une droite y = ax + b restreint au cadre (en x comme en y).
  const segment = (a: number, b: number, from: number, to: number) => {
    let x1 = Math.max(xMin, from)
    let x2 = Math.min(xMax, to)
    if (a !== 0) {
      const xa = (yMin - b) / a
      const xb = (yMax - b) / a
      const lo = Math.min(xa, xb)
      const hi = Math.max(xa, xb)
      x1 = Math.max(x1, lo)
      x2 = Math.min(x2, hi)
    }
    if (x2 <= x1) return null
    return { x1, y1: a * x1 + b, x2, y2: a * x2 + b }
  }

  const breakX = xMin > 0
  const breakY = yMin > 0
  const zig = (cx: number, cy: number, vertical: boolean) =>
    vertical
      ? `M${cx - 6},${cy + 7} L${cx + 6},${cy + 3} M${cx - 6},${cy - 3} L${cx + 6},${cy - 7}`
      : `M${cx - 7},${cy + 6} L${cx - 3},${cy - 6} M${cx + 3},${cy + 6} L${cx + 7},${cy - 6}`

  return (
    <svg viewBox={`0 0 ${F.w} ${F.h}`} role="img" aria-label="Nuage de points">
      {bands?.map((b, i) => {
        const x1 = px(Math.max(xMin, b.from))
        const x2 = px(Math.min(xMax, b.to))
        const cls = b.tone === 'good' ? 'svg-band-good' : b.tone === 'bad' ? 'svg-band-bad' : 'svg-band'
        return (
          <g key={`band-${i}`}>
            <rect x={x1} y={F.top} width={Math.max(0, x2 - x1)} height={F.bottom - F.top} className={cls} />
            {b.label && (
              <text x={(x1 + x2) / 2} y={F.bottom - 8} textAnchor="middle" className={TEXT_CLASS[b.tone]} fontFamily="IBM Plex Mono, monospace" fontSize={fs} fontWeight="600">
                {b.label}
              </text>
            )}
          </g>
        )
      })}

      {grid && (
        <g className="svg-grid" strokeWidth="1">
          {xTicks.filter((t) => t > xMin && t <= xMax).map((t) => (
            <line key={`gx-${t}`} x1={px(t)} y1={F.top} x2={px(t)} y2={F.bottom} />
          ))}
          {yTicks.filter((t) => t > yMin && t <= yMax).map((t) => (
            <line key={`gy-${t}`} x1={F.left} y1={py(t)} x2={F.right} y2={py(t)} />
          ))}
        </g>
      )}

      {/* Axes (bord gauche, bord bas), flèches, brisures. */}
      <line x1={F.left} y1={F.bottom} x2={F.right + 12} y2={F.bottom} className="svg-line" strokeWidth="1.5" markerEnd={`url(#${arrowId})`} />
      <line x1={F.left} y1={F.bottom} x2={F.left} y2={F.top - 10} className="svg-line" strokeWidth="1.5" markerEnd={`url(#${arrowId})`} />
      {breakX && (
        <>
          <rect x={F.left + 9} y={F.bottom - 7} width="10" height="14" style={{ fill: 'var(--surface)' }} />
          <path d={zig(F.left + 14, F.bottom, false)} className="svg-line" strokeWidth="1.5" fill="none" />
        </>
      )}
      {breakY && (
        <>
          <rect x={F.left - 7} y={F.bottom - 19} width="14" height="10" style={{ fill: 'var(--surface)' }} />
          <path d={zig(F.left, F.bottom - 14, true)} className="svg-line" strokeWidth="1.5" fill="none" />
        </>
      )}

      <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize={fs - 0.5}>
        {xTicks.map((t) => (
          <g key={`tx-${t}`}>
            <line x1={px(t)} y1={F.bottom} x2={px(t)} y2={F.bottom + 4} className="svg-line" strokeWidth="1" />
            <text x={px(t)} y={F.bottom + fs + 5} textAnchor="middle" stroke="none">
              {xTickLabels?.[t] ?? nombreTick(t)}
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`ty-${t}`}>
            <line x1={F.left - 4} y1={py(t)} x2={F.left} y2={py(t)} className="svg-line" strokeWidth="1" />
            <text x={F.left - 7} y={py(t) + 4} textAnchor="end" stroke="none">
              {yTickLabels?.[t] ?? nombreTick(t)}
            </text>
          </g>
        ))}
      </g>
      <text x={F.right + 10} y={F.bottom - 8} textAnchor="end" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize={fs}>
        {mathLabelTspans(xAxisLabel, fs)}
      </text>
      <text x={F.left + 8} y={F.top + 2} className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize={fs}>
        {mathLabelTspans(yAxisLabel, fs)}
      </text>

      {quadrants && (
        <g>
          {quadrants.rectangles &&
            points.map((p, i) => {
              const produit = (p.x - quadrants.x) * (p.y - quadrants.y)
              if (produit === 0) return null
              const x1 = Math.min(px(p.x), px(quadrants.x))
              const y1 = Math.min(py(p.y), py(quadrants.y))
              return (
                <rect
                  key={`qr-${i}`}
                  x={x1}
                  y={y1}
                  width={Math.abs(px(p.x) - px(quadrants.x))}
                  height={Math.abs(py(p.y) - py(quadrants.y))}
                  className={produit > 0 ? 'svg-band-good' : 'svg-band-bad'}
                />
              )
            })}
          <line x1={px(quadrants.x)} y1={F.top} x2={px(quadrants.x)} y2={F.bottom} className="svg-line" strokeWidth="1.3" strokeDasharray="5 4" />
          <line x1={F.left} y1={py(quadrants.y)} x2={F.right} y2={py(quadrants.y)} className="svg-line" strokeWidth="1.3" strokeDasharray="5 4" />
          {(
            [
              { sx: 1, sy: 1, signe: '+', cls: 'svg-good' },
              { sx: -1, sy: -1, signe: '+', cls: 'svg-good' },
              { sx: -1, sy: 1, signe: '−', cls: 'svg-bad' },
              { sx: 1, sy: -1, signe: '−', cls: 'svg-bad' },
            ] as const
          ).map((q) => (
            <text
              key={`qs-${q.sx}-${q.sy}`}
              x={q.sx > 0 ? F.right - 16 : F.left + 24}
              y={q.sy > 0 ? F.top + 26 : F.bottom - 30}
              textAnchor="middle"
              className={q.cls}
              stroke="none"
              fontFamily="IBM Plex Mono, monospace"
              fontSize={fs + 8}
              fontWeight="700"
            >
              {q.signe}
            </text>
          ))}
        </g>
      )}

      {residuals &&
        points.map((p, i) => {
          const yl = residuals.a * p.x + residuals.b
          const yp = py(clampY(p.y))
          const ylp = py(clampY(yl))
          const cote = Math.abs(yp - ylp)
          if (cote < 0.5) return null
          const xp = px(p.x)
          const aDroite = xp + cote <= F.right
          return (
            <g key={`res-${i}`}>
              {residuals.squares && (
                <rect x={aDroite ? xp : xp - cote} y={Math.min(yp, ylp)} width={cote} height={cote} className="svg-band-good" />
              )}
              {residuals.squares && (
                <rect x={aDroite ? xp : xp - cote} y={Math.min(yp, ylp)} width={cote} height={cote} className="svg-good-outline" strokeWidth="1" />
              )}
              <line x1={xp} y1={yp} x2={xp} y2={ylp} className="svg-bad-outline" strokeWidth="2" />
            </g>
          )
        })}

      {lines?.map((l, i) => {
        const s = segment(l.a, l.b, l.from ?? xMin, l.to ?? xMax)
        if (!s) return null
        const lx = l.labelX !== undefined ? Math.min(Math.max(l.labelX, s.x1), s.x2) : s.x1 + (s.x2 - s.x1) * 0.82
        const ly = l.a * lx + l.b
        const dessous = l.labelPos === 'below'
        // Étiquette du côté libre de la droite : au-dessus d'une droite qui monte, le texte part vers la
        // gauche (ancre « end ») ; au-dessus d'une droite qui descend, vers la droite — et l'inverse
        // en dessous. Une étiquette centrée sur le point chevaucherait le trait dès que la pente est forte.
        const ancre: 'start' | 'end' | 'middle' = l.a === 0 ? 'middle' : (l.a > 0) !== dessous ? 'end' : 'start'
        const dxLabel = ancre === 'end' ? -6 : ancre === 'start' ? 6 : 0
        return (
          <g key={`line-${i}`}>
            <line
              x1={px(s.x1)}
              y1={py(s.y1)}
              x2={px(s.x2)}
              y2={py(s.y2)}
              className={LINE_CLASS[l.tone]}
              strokeWidth="2.2"
              strokeDasharray={l.dashed ? '6 4' : undefined}
            />
            {l.label && (
              <text
                x={px(lx) + dxLabel}
                y={py(ly) + (dessous ? fs + 8 : -8)}
                textAnchor={ancre}
                className={TEXT_CLASS[l.tone]}
                stroke="none"
                fontFamily="IBM Plex Mono, monospace"
                fontSize={fs}
                fontWeight="600"
              >
                {mathLabelTspans(l.label, fs)}
              </text>
            )}
          </g>
        )
      })}

      {points.map((p, i) => (
        <g key={`pt-${i}`}>
          <circle cx={px(p.x)} cy={py(p.y)} r={compact ? 3.6 : 4.6} className={POINT_CLASS[p.tone ?? 'accent']} stroke="none" />
          {p.label && (
            <text x={px(p.x) + 7} y={py(p.y) - 7} className={TEXT_CLASS[p.tone ?? 'accent']} stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize={fs - 1}>
              {mathLabelTspans(p.label, fs - 1)}
            </text>
          )}
        </g>
      ))}

      {marks?.map((m, i) => {
        const cx = px(m.x)
        const cy = py(m.y)
        const pos = m.labelPos ?? 'above'
        const T: Record<string, { x: number; y: number; anchor: 'start' | 'middle' | 'end' }> = {
          above: { x: cx, y: cy - 14, anchor: 'middle' },
          below: { x: cx, y: cy + fs + 13, anchor: 'middle' },
          left: { x: cx - 13, y: cy + 5, anchor: 'end' },
          right: { x: cx + 13, y: cy + 5, anchor: 'start' },
          'above-left': { x: cx - 9, y: cy - 11, anchor: 'end' },
          'above-right': { x: cx + 9, y: cy - 11, anchor: 'start' },
          'below-left': { x: cx - 9, y: cy + fs + 9, anchor: 'end' },
          'below-right': { x: cx + 9, y: cy + fs + 9, anchor: 'start' },
        }
        const t = T[pos]
        return (
          <g key={`mk-${i}`}>
            {/* Cible : anneau de la teinte (sans remplissage) autour d'un point plein. */}
            <circle cx={cx} cy={cy} r="8.5" className={MARK_CLASS[m.tone]} style={{ fill: 'none' }} strokeWidth="2" />
            <circle cx={cx} cy={cy} r="4" className={MARK_FILL_CLASS[m.tone]} stroke="none" />
            <text x={t.x} y={t.y} textAnchor={t.anchor} className={TEXT_CLASS[m.tone]} stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize={fs + 1} fontWeight="700">
              {mathLabelTspans(m.label, fs + 1)}
            </text>
          </g>
        )
      })}

      <defs>
        {/* markerUnits="userSpaceOnUse", dimensions compensées par le strokeWidth 1,5 des axes
            (`illustration-components.md`) ; id unique par figure (`useId`) : plusieurs nuages par page. */}
        <marker id={arrowId} markerWidth="12" markerHeight="12" refX="9" refY="6" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L12,6 L0,12 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  )
}
