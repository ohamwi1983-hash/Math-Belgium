import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'sequenceOutcomes' }>, 'caption'>

const W = 460
const ROW_GAP = 62
const FIRST_ROW_Y = 44
const NODE_R = 12
const NODE_X = [104, 164, 224]
const RESULT_X = 258
const BRACKET_X = 322
const LABEL_X = 340

const NODE_CLASS: Record<'accent' | 'good', string> = { accent: 'svg-accent', good: 'svg-good' }

/**
 * Séquences d'issues dépliées, une par ligne (chaque ligne = un chemin complet, avec la
 * probabilité de chaque tirage), plus l'accolade qui regroupe les lignes équiprobables.
 */
export function SequenceOutcomes({ rows, bracketLabel, footer }: Props) {
  const H = FIRST_ROW_Y + (rows.length - 1) * ROW_GAP + 74
  const rowY = (i: number) => FIRST_ROW_Y + i * ROW_GAP
  const bracketTop = rowY(0) - 20
  const bracketBottom = rowY(rows.length - 1) + 20
  const bracketMid = (bracketTop + bracketBottom) / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${rows.length} séquences d'issues équiprobables et leur regroupement`}>
      {rows.map((row, i) => {
        const y = rowY(i)
        return (
          <g key={i}>
            <text x="10" y={y + 4} className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12.5">
              {row.label}
            </text>
            {row.steps.map((step, k) => (
              <g key={k}>
                {k > 0 && <line x1={NODE_X[k - 1] + NODE_R} y1={y} x2={NODE_X[k] - NODE_R} y2={y} className="svg-line" strokeWidth="1.2" />}
                <circle cx={NODE_X[k]} cy={y} r={NODE_R} className={NODE_CLASS[step.tone]} stroke="none" />
                <text x={NODE_X[k]} y={y + 4} textAnchor="middle" fill="var(--surface)" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="12">
                  {step.label}
                </text>
                <text x={NODE_X[k]} y={y + 26} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="11.5">
                  {step.prob}
                </text>
              </g>
            ))}
            <text x={RESULT_X} y={y + 4} className="svg-accent" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12.5" fontWeight="600">
              {row.resultLabel}
            </text>
          </g>
        )
      })}

      <line x1={BRACKET_X} y1={bracketTop} x2={BRACKET_X} y2={bracketBottom} className="svg-line" strokeWidth="1.2" />
      <line x1={BRACKET_X} y1={bracketTop} x2={BRACKET_X + 7} y2={bracketTop} className="svg-line" strokeWidth="1.2" />
      <line x1={BRACKET_X} y1={bracketBottom} x2={BRACKET_X + 7} y2={bracketBottom} className="svg-line" strokeWidth="1.2" />
      <line x1={BRACKET_X} y1={bracketMid} x2={LABEL_X - 4} y2={bracketMid} className="svg-line" strokeWidth="1.2" />
      {bracketLabel.map((line, i) => (
        <text
          key={i}
          x={LABEL_X}
          y={bracketMid - (bracketLabel.length - 1) * 7 + i * 14 + 4}
          className="svg-good"
          stroke="none"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="12"
          fontWeight="600"
        >
          {line}
        </text>
      ))}

      <text x={W / 2} y={H - 12} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {footer}
      </text>
    </svg>
  )
}
