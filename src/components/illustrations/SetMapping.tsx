import { useId } from 'react'
import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'setMapping' }>, 'caption'>

const X_A = 32
const X_B = 118
const Y_TOP = 24
const Y_BOTTOM = 126
const LABEL_Y = 144

/**
 * Diagramme d'application entre deux ensembles A et B : points + flèches, pour illustrer
 * injectivité/surjectivité/bijectivité. Utilisé plusieurs fois sur une même page (3 diagrammes
 * comparés) — l'id du marqueur de flèche doit donc être unique par instance (`useId`), pas fixe.
 */
export function SetMapping({ setALabel, setBLabel, pointsA, pointsB, arrows }: Props) {
  const markerId = `setmap-arrow-${useId()}`
  const yFor = (f: number) => Y_TOP + f * (Y_BOTTOM - Y_TOP)

  return (
    <svg viewBox="0 0 150 150" role="img" aria-label={`Diagramme d'application entre les ensembles ${setALabel} et ${setBLabel}`}>
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>

      {arrows.map((a, i) => (
        <line
          key={i}
          x1={X_A + 9}
          y1={yFor(pointsA[a.from])}
          x2={X_B - 9}
          y2={yFor(pointsB[a.to])}
          className="svg-line"
          strokeWidth="1.5"
          markerEnd={`url(#${markerId})`}
        />
      ))}

      {pointsA.map((f, i) => (
        <circle key={`a${i}`} cx={X_A} cy={yFor(f)} r="5" className="svg-ink" />
      ))}
      {pointsB.map((f, i) => (
        <circle key={`b${i}`} cx={X_B} cy={yFor(f)} r="5" className="svg-ink" />
      ))}

      <text x={X_A} y={LABEL_Y} textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14">
        {setALabel}
      </text>
      <text x={X_B} y={LABEL_Y} textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14">
        {setBLabel}
      </text>
    </svg>
  )
}
