import { useId } from 'react'
import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'planeSketch' }>, 'caption'>

const LINE_TONE_CLASS: Record<'ink' | 'faint' | 'accent' | 'good' | 'bad' | 'attn', string> = {
  ink: 'svg-line',
  faint: 'svg-faint',
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  attn: 'svg-attn',
}
const POINT_TONE_CLASS: Record<'ink' | 'accent' | 'good', string> = { ink: 'svg-ink', accent: 'svg-accent', good: 'svg-good' }
const LABEL_TONE_CLASS: Record<'ink' | 'accent' | 'good' | 'bad' | 'plan', string> = {
  ink: 'svg-ink',
  accent: 'svg-accent',
  good: 'svg-good',
  bad: 'svg-bad',
  plan: 'svg-plan-ink',
}
/** Couleur de remplissage de la pointe de flèche par teinte — `svg-line`/`svg-faint` ne posent
 * qu'un `stroke`, jamais de `fill` (voir index.css) : la pointe a besoin d'un remplissage propre,
 * indépendant de la classe utilitaire utilisée pour le trait lui-même. */
const ARROW_FILL: Record<'ink' | 'faint' | 'accent' | 'good' | 'bad' | 'attn', string> = {
  ink: 'var(--ink-soft)',
  faint: 'var(--line)',
  accent: 'var(--accent)',
  good: 'var(--good)',
  bad: 'var(--bad)',
  attn: 'var(--attn)',
}

/**
 * Schéma géométrique abstrait dans l'espace (plans/droites/points libres), PAS bâti sur un solide
 * nommé — voir `SolidCavaliere` pour ça. Composant générique qui couvre « déterminer un plan »,
 * « deux/trois plans », « point de percée », les diagrammes de direction de l'ombre au soleil et
 * la perspective centrale.
 */
export function PlaneSketch({ width, height, planes, lines, points, freeLabels }: Props) {
  const markerId = `plane-${useId()}`
  const tones: ('ink' | 'faint' | 'accent' | 'good' | 'bad' | 'attn')[] = ['ink', 'faint', 'accent', 'good', 'bad', 'attn']

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Schéma géométrique">
      <defs>
        {tones.map((tone) => (
          <marker key={tone} id={`${markerId}-${tone}`} viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" style={{ fill: ARROW_FILL[tone] }} />
          </marker>
        ))}
      </defs>

      {planes?.map((plane, i) => (
        <polygon
          key={i}
          points={plane.points.map((p) => `${p.x},${p.y}`).join(' ')}
          className={plane.style === 'plan' ? 'svg-plan-fill' : plane.style === 'planDashed' ? 'svg-plan-outline' : 'svg-surface2'}
          strokeWidth={plane.style === 'planDashed' ? 1.6 : plane.style === 'ground' ? 1.3 : undefined}
          strokeDasharray={plane.style === 'planDashed' ? '5 3' : undefined}
          stroke={plane.style === 'ground' ? 'var(--line)' : undefined}
        />
      ))}

      {lines?.map((line, i) => {
        const d = `M${line.points.map((p) => `${p.x},${p.y}`).join(' L')}${line.closed ? ' Z' : ''}`
        return (
          <path
            key={i}
            d={d}
            style={{ fill: 'none' }}
            className={LINE_TONE_CLASS[line.tone]}
            strokeWidth={line.tone === 'accent' || line.tone === 'good' ? 2.4 : 1.8}
            strokeDasharray={line.dashed ? '5 3' : undefined}
            markerEnd={line.arrow ? `url(#${markerId}-${line.tone})` : undefined}
          />
        )
      })}

      {points?.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" className={POINT_TONE_CLASS[p.tone ?? 'ink']} />
          {p.label && (
            <text
              x={p.x + (p.labelDx ?? 10)}
              y={p.y + (p.labelDy ?? -8)}
              fontSize="14"
              className={POINT_TONE_CLASS[p.tone ?? 'ink']}
              fontStyle="italic"
              fontFamily="Fraunces, serif"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}

      {/* Un symbole court (nom de point/droite/plan) suit la même convention que les labels de
          points ailleurs sur le site : italique, serif, comme une notation mathématique. Une
          phrase plus longue (annotation en toutes lettres, ex. "point de percée") reste en texte
          courant, jamais italique — un mot complet en italique-serif à cette échelle de diagramme
          devient disproportionné et pénible à lire. Un ✓/✗ de validation est un pictogramme, pas
          une lettre : taille généreuse, jamais italique (l'italique déforme le tracé du glyphe). */}
      {freeLabels?.map((l, i) => {
        const isCheckOrCross = l.text === '✓' || l.text === '✗'
        const isSymbol = !isCheckOrCross && l.text.length <= 3
        return (
          <text
            key={i}
            x={l.x}
            y={l.y}
            fontSize={isCheckOrCross ? 22 : isSymbol ? 15 : 12}
            className={LABEL_TONE_CLASS[l.tone ?? 'ink']}
            fontStyle={isSymbol ? 'italic' : 'normal'}
            fontFamily={isCheckOrCross ? undefined : isSymbol ? 'Fraunces, serif' : 'Work Sans, sans-serif'}
          >
            {l.text}
          </text>
        )
      })}
    </svg>
  )
}
