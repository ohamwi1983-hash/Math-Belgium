import type { ReactNode } from 'react'

/**
 * Convertit une étiquette texte brute (ex. "u_n", "A_n (+2000/an)") en tspans SVG avec un vrai
 * indice — convention LaTeX ("_" déclenche un indice, "_{...}" pour un indice de plusieurs
 * caractères) appliquée aux labels d'illustration, qui ne passent jamais par RichText/KaTeX (texte
 * brut dans un <text> SVG, voir .claude/rules/content-authoring.md). Sans "_", le texte ressort
 * inchangé dans un unique tspan — sans effet sur les labels déjà en place ailleurs.
 */
const SUBSCRIPT_RE = /_\{([^}]+)\}|_([^\s)])/g

export function mathLabelTspans(text: string, baseFontSize: number): ReactNode[] {
  const subFontSize = +(baseFontSize * 0.72).toFixed(2)
  const dyDown = +(baseFontSize * 0.28).toFixed(2)
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  let pendingDy: number | undefined
  let match: RegExpExecArray | null
  SUBSCRIPT_RE.lastIndex = 0
  while ((match = SUBSCRIPT_RE.exec(text))) {
    if (match.index > last) {
      nodes.push(
        <tspan key={key++} dy={pendingDy}>
          {text.slice(last, match.index)}
        </tspan>,
      )
      pendingDy = undefined
    }
    nodes.push(
      <tspan key={key++} dy={dyDown} fontSize={subFontSize}>
        {match[1] ?? match[2]}
      </tspan>,
    )
    pendingDy = -dyDown
    last = SUBSCRIPT_RE.lastIndex
  }
  if (last < text.length || nodes.length === 0) {
    nodes.push(
      <tspan key={key++} dy={pendingDy}>
        {text.slice(last)}
      </tspan>,
    )
  }
  return nodes
}
