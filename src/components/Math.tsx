import { Fragment, memo } from 'react'
import type { ReactNode } from 'react'
import katex from 'katex'
import { normaliserLogDecimal } from '../lib/notationLog'

/** Renders a single LaTeX expression inline via KaTeX. */
export const MathInline = memo(function MathInline({ tex }: { tex: string }) {
  const html = katex.renderToString(normaliserLogDecimal(tex), {
    throwOnError: false,
    output: 'html',
  })
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
})

// Splits a content string on `$...$` (KaTeX) and `**...**` (bold) segments,
// so chapter content can stay plain data instead of JSX.
const TOKEN_RE = /\$([^$]+)\$|\*\*([^*]+)\*\*/g

/** Typographie française, d'office (planche 11 des maquettes « côté élève ») : espace insécable avant
 * « : ; ? ! » et à l'intérieur de « … » — jamais « : » ni « » » seuls en début de ligne. Seules les
 * espaces ORDINAIRES sont remplacées (les données ne sont pas réécrites ; un texte déjà insécable ne
 * change pas). Même DOM à l'impression et dans l'export HTML : des coupures de ligne en mieux seulement. */
export function insecablesFr(t: string): string {
  return t.replace(/ ([:;?!»])/g, ' $1').replace(/« /g, '« ')
}

/** Ce qui reste collé à une formule (`.math-inline` est un inline-block : le navigateur coupait juste
 * après, d'où une virgule seule en début de ligne) : la ponctuation qui la SUIT (« $u_n$, »,
 * « $x$ : ») et la parenthèse ou le guillemet ouvrant qui la PRÉCÈDE. */
const COLLE_APRES = /^(?:[,.;:!?…)\]»]| [:;?!»])+/
const COLLE_AVANT = /(?:[([]|« )$/

type Morceau = { texte: string } | { tex: string; avant: string; apres: string } | { gras: string }

/** Renders a data string containing `$latex$` math and `**bold**` emphasis. */
export const RichText = memo(function RichText({ text }: { text: string }) {
  const morceaux: Morceau[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  TOKEN_RE.lastIndex = 0
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) morceaux.push({ texte: insecablesFr(text.slice(lastIndex, match.index)) })
    if (match[1] !== undefined) morceaux.push({ tex: match[1], avant: '', apres: '' })
    else if (match[2] !== undefined) morceaux.push({ gras: insecablesFr(match[2]) })
    lastIndex = TOKEN_RE.lastIndex
  }
  if (lastIndex < text.length) morceaux.push({ texte: insecablesFr(text.slice(lastIndex)) })

  // Ponctuation et parenthèses détachées du texte voisin pour rester avec leur formule.
  morceaux.forEach((m, i) => {
    if (!('tex' in m)) return
    const prec = morceaux[i - 1]
    if (prec && 'texte' in prec) {
      const a = COLLE_AVANT.exec(prec.texte)
      if (a) {
        m.avant = a[0]
        prec.texte = prec.texte.slice(0, -a[0].length)
      }
    }
    const suiv = morceaux[i + 1]
    if (suiv && 'texte' in suiv) {
      const b = COLLE_APRES.exec(suiv.texte)
      if (b) {
        m.apres = b[0]
        suiv.texte = suiv.texte.slice(b[0].length)
      }
    }
  })

  const parts: ReactNode[] = []
  morceaux.forEach((m, key) => {
    if ('gras' in m) parts.push(<strong key={key}>{m.gras}</strong>)
    else if ('texte' in m) {
      if (m.texte) parts.push(<Fragment key={key}>{m.texte}</Fragment>)
    } else if (m.avant || m.apres) {
      parts.push(
        <span className="colle" key={key}>
          {m.avant}
          <MathInline tex={m.tex} />
          {m.apres}
        </span>,
      )
    } else parts.push(<MathInline key={key} tex={m.tex} />)
  })
  return <>{parts}</>
})

/** Renders a data string as a full paragraph of rich text. */
export function RichParagraph({ text }: { text: string }) {
  return (
    <p>
      <RichText text={text} />
    </p>
  )
}
