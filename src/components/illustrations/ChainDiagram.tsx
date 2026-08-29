import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'chain' }>, 'caption'>

const BOX_W = 90
const BOX_H = 80
const GAP = 45
const BOX_Y = 25
const MID_Y = BOX_Y + BOX_H / 2
const START_X = 65

/**
 * Chaîne à N étages : x → stage₁ → stage₂ → … → sortie.
 * Le dernier étage appliqué (le plus extérieur dans une décomposition) est mis en évidence.
 */
export function ChainDiagram({ stages, highlightIndex, outputLabel }: Props) {
  const outputW = Math.max(140, 60 + outputLabel.length * 11)
  const boxStarts = stages.map((_, i) => START_X + i * (BOX_W + GAP))
  const outputX = boxStarts[boxStarts.length - 1] + BOX_W + GAP
  const viewW = outputX + outputW + 8

  return (
    <svg viewBox={`0 0 ${viewW} 130`} role="img" aria-label={`Chaîne à ${stages.length} étages : x entre dans ${stages[0]}, puis les étages suivants, ${outputLabel} sort`}>
      <line x1="8" y1={MID_Y} x2={START_X - 5} y2={MID_Y} className="svg-line" strokeWidth="2" markerEnd="url(#chain-arrow)" />
      <text x={(8 + START_X - 5) / 2} y={MID_Y - 13} textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16">x</text>

      {stages.map((label, i) => {
        const x = boxStarts[i]
        const isLast = i === highlightIndex
        return (
          <g key={i}>
            <rect
              x={x}
              y={BOX_Y}
              width={BOX_W}
              height={BOX_H}
              rx="3"
              fill="none"
              className={isLast ? 'svg-accent-outline' : 'svg-line'}
              strokeWidth="2"
            />
            <text x={x + BOX_W / 2} y={MID_Y + 7} textAnchor="middle" className={isLast ? 'svg-accent' : 'svg-ink'} fontFamily="Fraunces, serif" fontSize="21" fontStyle="italic">
              {label}
            </text>
            <line x1={x + BOX_W} y1={MID_Y} x2={x + BOX_W + GAP} y2={MID_Y} className="svg-line" strokeWidth="2" markerEnd="url(#chain-arrow)" />
          </g>
        )
      })}

      <rect x={outputX} y={BOX_Y} width={outputW} height={BOX_H} rx="3" className="svg-faint" fill="none" strokeWidth="1.5" strokeDasharray="3 4" />
      <text x={outputX + outputW / 2} y={MID_Y + 7} textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontSize="18" fontStyle="italic">
        {outputLabel}
      </text>

      <defs>
        <marker id="chain-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  )
}
