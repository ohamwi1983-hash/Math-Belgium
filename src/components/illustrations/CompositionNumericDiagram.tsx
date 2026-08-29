import type { IllustrationSpec } from '../../content/types'
import { catmullRomPath } from '../../lib/svgPath'

type Props = Omit<Extract<IllustrationSpec, { kind: 'compositionNumeric' }>, 'caption'>

// Marge gauche généreuse : les étiquettes de valeur ("f(a)=…") sont ancrées à gauche de l'axe
// et ne doivent pas sortir du viewBox (un <svg> racine cadre son contenu par défaut).
const X_LEFT = 110
const X_RIGHT = 610
const TOP_Y0 = 140 // valeur 0
const TOP_Y1 = 20 // haut du tracé de l'axe
const BOT_Y0 = 300
const BOT_Y1 = 196
// La valeur max ne touche jamais le haut de l'axe : marge pour que son étiquette ne chevauche
// pas le label "C_f"/"C_g" du coin, comme dans l'artifact source.
const HEADROOM = 16

/** Lecture chiffrée de (g∘f)(a) sur deux graphes gradués empilés. */
export function CompositionNumericDiagram({ fLabel, gLabel, a, fa, gfa, xMax, topYMax, bottomYMax }: Props) {
  const xScale = (v: number) => X_LEFT + (v / xMax) * (X_RIGHT - X_LEFT)
  const topYScale = (v: number) => TOP_Y0 + (v / topYMax) * (TOP_Y1 + HEADROOM - TOP_Y0)
  const botYScale = (v: number) => BOT_Y0 + (v / bottomYMax) * (BOT_Y1 + HEADROOM - BOT_Y0)

  const tickStep = Math.max(1, Math.round(xMax / 3))
  const xTicks: number[] = []
  for (let v = 0; v <= xMax + 1e-9; v += tickStep) xTicks.push(Math.round(v))

  const topPath = catmullRomPath([
    [X_LEFT, topYScale(Math.min(topYMax, fa * 0.15))],
    [xScale(a), topYScale(fa)],
    [X_RIGHT, topYScale(Math.min(topYMax, fa * 1.05))],
  ])
  const botPath = catmullRomPath([
    [X_LEFT, botYScale(Math.max(0, Math.min(bottomYMax, gfa * 0.1)))],
    [xScale(fa), botYScale(gfa)],
    [X_RIGHT, botYScale(Math.min(bottomYMax, gfa * 1.05))],
  ])

  const markAx = xScale(a)
  const markFaY = topYScale(fa)
  const markFaX = xScale(fa)
  const markGfaY = botYScale(gfa)

  return (
    <svg viewBox="0 0 640 320" role="img" aria-label={`Deux graphes gradués illustrant (g∘f)(${a}) = ${gfa}`}>
      <text x="20" y="20" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16">
        C<tspan baselineShift="sub" fontSize="11">{fLabel}</tspan>
      </text>
      <line x1={X_LEFT} y1="20" x2={X_LEFT} y2="140" className="svg-line" strokeWidth="1.5" markerEnd="url(#cn-arrow)" />
      <line x1={X_LEFT} y1="140" x2={X_RIGHT} y2="140" className="svg-line" strokeWidth="1.5" markerEnd="url(#cn-arrow)" />
      <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11">
        {xTicks.map((t) => (
          <text key={t} x={xScale(t)} y="155" textAnchor="middle">{t}</text>
        ))}
        <text x={X_LEFT - 15} y="144" textAnchor="end">0</text>
        <text x={X_LEFT - 15} y={topYScale(topYMax) + 4} textAnchor="end">{topYMax}</text>
      </g>
      <path d={topPath} fill="none" className="svg-line" strokeWidth="2.5" />
      <line x1={markAx} y1="140" x2={markAx} y2={markFaY} className="svg-accent" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={markAx} cy={markFaY} r="4" className="svg-accent" />
      <line x1={markAx} y1={markFaY} x2={X_LEFT} y2={markFaY} className="svg-accent" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x={markAx} y="175" textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600">a={a}</text>
      <text x={X_LEFT - 28} y={markFaY + 4} textAnchor="end" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600">{fLabel}({a})={fa}</text>

      <text x="20" y="196" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16">
        C<tspan baselineShift="sub" fontSize="11">{gLabel}</tspan>
      </text>
      <line x1={X_LEFT} y1="196" x2={X_LEFT} y2="300" className="svg-line" strokeWidth="1.5" markerEnd="url(#cn-arrow)" />
      <line x1={X_LEFT} y1="300" x2={X_RIGHT} y2="300" className="svg-line" strokeWidth="1.5" markerEnd="url(#cn-arrow)" />
      <g className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="11">
        {xTicks.map((t) => (
          <text key={t} x={xScale(t)} y="315" textAnchor="middle">{t}</text>
        ))}
        <text x={X_LEFT - 15} y="304" textAnchor="end">0</text>
        <text x={X_LEFT - 15} y={botYScale(bottomYMax) + 4} textAnchor="end">{bottomYMax}</text>
      </g>
      <path d={botPath} fill="none" className="svg-line" strokeWidth="2.5" />
      <line x1={markFaX} y1="300" x2={markFaX} y2={markGfaY} className="svg-good" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={markFaX} cy={markGfaY} r="4" className="svg-good" />
      <line x1={markFaX} y1={markGfaY} x2={X_LEFT} y2={markGfaY} className="svg-good" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x={markFaX} y="335" textAnchor="middle" className="svg-good" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600">{fLabel}({a})={fa}</text>
      <text x={X_LEFT - 28} y={markGfaY + 4} textAnchor="end" className="svg-good" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600">{gLabel}({fa})={gfa}</text>

      <defs>
        <marker id="cn-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  )
}
