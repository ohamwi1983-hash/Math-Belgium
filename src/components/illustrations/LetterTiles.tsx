import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'letterTiles' }>, 'caption'>

const W = 460
const H = 160
const TILE_TOP = 22
const TILE_H = 58
const GAP = 6

type Tone = 'accent' | 'good' | 'ink' | 'outline'

const FILL: Record<Tone, string> = {
  accent: 'var(--accent)',
  good: 'var(--good)',
  ink: 'var(--ink)',
  outline: 'var(--surface-2)',
}
const TEXT_FILL: Record<Tone, string> = {
  accent: 'var(--on-accent)',
  good: 'var(--surface)',
  ink: 'var(--surface)',
  outline: 'var(--ink)',
}

/** Rangée de tuiles-lettres colorées par identité de lettre + légende des effectifs. */
export function LetterTiles({ letters, legend }: Props) {
  const toneOf = (ch: string): Tone => legend.find((l) => l.letter === ch)?.tone ?? 'outline'

  const tileW = Math.min(44, (W - 2 * 16 - GAP * (letters.length - 1)) / letters.length)
  const rowW = letters.length * tileW + GAP * (letters.length - 1)
  const startX = (W - rowW) / 2

  const legendStep = Math.min(110, (W - 2 * 24) / legend.length)
  const legendStart = (W - legendStep * legend.length) / 2 + 10

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Les ${letters.length} lettres du mot ${letters.join('')}, colorées par identité de lettre`}>
      {letters.map((ch, i) => {
        const tone = toneOf(ch)
        const x = startX + i * (tileW + GAP)
        return (
          <g key={i}>
            <rect
              x={x}
              y={TILE_TOP}
              width={tileW}
              height={TILE_H}
              rx="6"
              fill={FILL[tone]}
              stroke={tone === 'outline' ? 'var(--ink)' : 'none'}
              strokeWidth={tone === 'outline' ? 1.6 : 0}
            />
            <text
              x={x + tileW / 2}
              y={TILE_TOP + TILE_H / 2 + 8}
              textAnchor="middle"
              fill={TEXT_FILL[tone]}
              fontFamily="IBM Plex Mono, monospace"
              fontWeight="700"
              fontSize="23"
            >
              {ch}
            </text>
          </g>
        )
      })}

      {legend.map((item, i) => {
        const x = legendStart + i * legendStep
        return (
          <g key={`lg${i}`}>
            <rect
              x={x}
              y={H - 44}
              width="14"
              height="14"
              rx="3"
              fill={FILL[item.tone]}
              stroke={item.tone === 'outline' ? 'var(--ink)' : 'none'}
              strokeWidth={item.tone === 'outline' ? 1.4 : 0}
            />
            <text x={x + 21} y={H - 32} className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12.5">
              {item.letter} × {item.count}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
