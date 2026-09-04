import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'groupPartition' }>, 'caption'>

const W = 460
const H = 280
const MARGIN = 18
const BOX_GAP = 14
const BOX_TOP = 96
const BOX_H = 118

const TOKEN_CLASS: Record<'accent' | 'good' | 'faint', string> = {
  accent: 'svg-accent',
  good: 'svg-good',
  faint: 'svg-ink-faint',
}
const BOX_FILL: Record<'accent' | 'good' | 'faint', string> = {
  accent: 'var(--accent)',
  good: 'var(--good)',
  faint: 'var(--ink-faint)',
}

/** Répartition d'un pool de jetons dans des boîtes nommées de tailles fixées (multinomiale). */
export function GroupPartition({ poolLabel, groups, formulaLabel }: Props) {
  const total = groups.reduce((s, g) => s + g.size, 0)
  const usable = W - 2 * MARGIN - BOX_GAP * (groups.length - 1)

  let cursor = MARGIN
  const boxes = groups.map((g) => {
    const width = (usable * g.size) / total
    const box = { x: cursor, width, cx: cursor + width / 2, ...g }
    cursor += width + BOX_GAP
    return box
  })

  // Un jeton du pool par membre, coloré selon le groupe auquel il finira par appartenir.
  const poolTones = groups.flatMap((g) => Array.from({ length: g.size }, () => g.tone))
  const poolStep = total > 1 ? (W - 2 * MARGIN - 20) / (total - 1) : 0
  const poolX = (i: number) => MARGIN + 10 + i * poolStep

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${total} éléments répartis en ${groups.length} groupes de tailles ${groups.map((g) => g.size).join(', ')}`}>
      <text x={W / 2} y="16" textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12">
        {poolLabel}
      </text>
      {poolTones.map((tone, i) => (
        <circle key={`p${i}`} cx={poolX(i)} cy="36" r="7" className={TOKEN_CLASS[tone]} stroke="none" />
      ))}

      {boxes.map((b, i) => (
        <g key={`c${i}`}>
          <line x1={b.cx} y1="48" x2={b.cx} y2={BOX_TOP - 26} className="svg-faint" strokeWidth="1.2" strokeDasharray="4 3" />
          <text x={b.cx} y={BOX_TOP - 12} textAnchor="middle" className={TOKEN_CLASS[b.tone]} stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="14" fontWeight="700">
            {b.size}
          </text>
        </g>
      ))}

      {boxes.map((b, i) => {
        const topCount = b.size > 3 ? Math.ceil(b.size / 2) : b.size
        const bottomCount = b.size - topCount
        const rowY = bottomCount > 0 ? [BOX_TOP + 40, BOX_TOP + 80] : [BOX_TOP + BOX_H / 2]
        const spread = (count: number, idx: number) => b.cx + (idx - (count - 1) / 2) * Math.min(34, (b.width - 24) / Math.max(count, 1))
        return (
          <g key={`b${i}`}>
            <rect
              x={b.x}
              y={BOX_TOP}
              width={b.width}
              height={BOX_H}
              rx="7"
              fill={BOX_FILL[b.tone]}
              fillOpacity="0.09"
              className={b.tone === 'faint' ? 'svg-faint' : b.tone === 'good' ? 'svg-good-outline' : 'svg-accent-outline'}
              strokeWidth="1.5"
            />
            {Array.from({ length: topCount }, (_, k) => (
              <circle key={`t${k}`} cx={spread(topCount, k)} cy={rowY[0]} r="9" className={TOKEN_CLASS[b.tone]} stroke="none" />
            ))}
            {Array.from({ length: bottomCount }, (_, k) => (
              <circle key={`u${k}`} cx={spread(bottomCount, k)} cy={rowY[1]} r="9" className={TOKEN_CLASS[b.tone]} stroke="none" />
            ))}
          </g>
        )
      })}

      <text x={W / 2} y={H - 10} textAnchor="middle" className="svg-ink-faint" fontFamily="IBM Plex Mono, monospace" fontSize="12.5">
        {formulaLabel}
      </text>
    </svg>
  )
}
