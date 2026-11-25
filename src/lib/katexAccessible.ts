import { lireFormule } from './lectureFormules'

function echapperAttribut(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Rend accessible un HTML produit par `katex.renderToString` (corrigés et tableaux construits en
 * chaîne HTML, ateliers en Shadow DOM) : `role="img"` et `aria-label` = lecture en mots
 * (`lectureFormules.ts`) posés sur l'élément RACINE de KaTeX (`<span class="katex">` ou
 * `<span class="katex-display">`), sans élément ajouté — la mise en page ne change pas.
 * `source` = le LaTeX effectivement rendu.
 */
export function htmlKatexAccessible(html: string, source: string): string {
  const lu = lireFormule(source)
  if (!lu) return html
  return html.replace(/^<span\b/, `<span role="img" aria-label="${echapperAttribut(lu)}"`)
}
