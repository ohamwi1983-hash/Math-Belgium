import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'complementBar' }>, 'caption'>

const W = 460
const H = 216
const BAR_X = 24
const BAR_Y = 94
const BAR_W = 412
const BAR_H = 56

/**
 * Une seule barre de longueur 1 partagée entre deux parts complémentaires — la figure du
 * raisonnement « au moins un = 1 − aucun ». Les longueurs viennent des fractions fournies, dont
 * la somme vaut 1 par construction de l'énoncé.
 */
export function ComplementBar({ headline, parts, footer, warning }: Props) {
  let cursor = BAR_X
  const placed = parts.map((p) => {
    const w = p.fraction * BAR_W
    const box = { ...p, x: cursor, w }
    cursor += w
    return box
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={headline}>
      <text x={W / 2} y="24" textAnchor="middle" className="svg-ink" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700">
        {headline}
      </text>

      {placed.map((p, i) => (
        <rect key={i} x={p.x} y={BAR_Y} width={p.w} height={BAR_H} fill={p.tone === 'accent' ? 'var(--accent)' : 'var(--ink-faint)'} opacity={p.tone === 'accent' ? 0.78 : 0.35} />
      ))}
      <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H} fill="none" className="svg-line" strokeWidth="1.4" />
      {placed.slice(1).map((p, i) => (
        <line key={i} x1={p.x} y1={BAR_Y} x2={p.x} y2={BAR_Y + BAR_H} className="svg-line" strokeWidth="1.6" />
      ))}

      {placed.map((p, i) => {
        // La petite part est trop étroite pour porter son étiquette centrée : on l'ancre au bord
        // gauche de la barre et on la relie à sa part par un trait fin, plutôt que de la laisser
        // déborder sur l'étiquette voisine.
        const narrow = p.w < 120
        const x = narrow ? BAR_X : p.x + p.w / 2
        return (
          <g key={i}>
            <text
              x={x}
              y={BAR_Y - 14}
              textAnchor={narrow ? 'start' : 'middle'}
              className={p.tone === 'accent' ? 'svg-accent' : 'svg-ink-faint'}
              stroke="none"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="12.5"
              fontWeight="700"
            >
              {p.label}
            </text>
            {narrow && <line x1={p.x + p.w / 2} y1={BAR_Y - 10} x2={p.x + p.w / 2} y2={BAR_Y} className="svg-faint" strokeWidth="1.2" />}
          </g>
        )
      })}

      <text x={W / 2} y={BAR_Y + BAR_H + 30} textAnchor="middle" className="svg-ink" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12.5">
        {footer}
      </text>
      {warning && (
        <text x={W / 2} y={BAR_Y + BAR_H + 54} textAnchor="middle" className="svg-bad" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="12.5">
          {warning}
        </text>
      )}
    </svg>
  )
}
