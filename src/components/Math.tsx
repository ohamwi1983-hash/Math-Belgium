import { createContext, Fragment, memo, useContext } from 'react'
import type { ReactNode } from 'react'
import { Link, useInRouterContext } from 'react-router-dom'
import katex from 'katex'
import { normaliserLogDecimal } from '../lib/notationLog'
import { lireFormule } from '../lib/lectureFormules'
import { resoudreLien } from '../lib/lienChapitre'

/** Correspondances (option « Couleurs et soulignés qui se correspondent », planche 09) : SEULE commande
 * de confiance admise, `\htmlClass{m1}{…}` / `m2` / `m3` (une simple classe sur un `<span>` ; KaTeX
 * garde exactement le même placement et les mêmes espaces). Sans l'option, aucun style : rendu
 * identique. Voir `.claude/rules/content-authoring.md`, « Correspondances ». */
const confiance = (ctx: { command: string; class?: string }) => ctx.command === '\\htmlClass' && /^m[1-3]$/.test(ctx.class ?? '')

/** Renders a single LaTeX expression inline via KaTeX. */
export const MathInline = memo(function MathInline({ tex }: { tex: string }) {
  const source = normaliserLogDecimal(tex)
  const html = katex.renderToString(source, {
    throwOnError: false,
    output: 'html',
    trust: confiance,
    // `\htmlClass` est une extension HTML : sans ceci, le mode strict par défaut (« warn ») l'écrirait
    // dans la console à chaque rendu. Tout le reste garde l'avertissement d'avant.
    strict: (code: string) => (code === 'htmlExtension' ? 'ignore' : 'warn'),
  })
  // Formule accessible : la sortie HTML de KaTeX est `aria-hidden` ; le conteneur porte la lecture
  // en mots (`lib/lectureFormules.ts`), présente dès le HTML pré-rendu.
  const lu = lireFormule(source)
  return <span className="math-inline" role={lu ? 'img' : undefined} aria-label={lu || undefined} dangerouslySetInnerHTML={{ __html: html }} />
})

// Splits a content string on `$...$` (KaTeX), `**...**` (bold) and `[[niveau/slug#section|texte]]`
// (lien nommé vers un autre chapitre, `lib/lienChapitre.ts`) segments, so chapter content can stay
// plain data instead of JSX.
const TOKEN_RE = /\$([^$]+)\$|\*\*([^*]+)\*\*|\[\[([^\]|#]+?)(?:#([^\]|]+?))?(?:\|([^\]]+?))?\]\]/g

/**
 * Comment un lien nommé `[[…]]` est rendu dans ce sous-arbre :
 * - `lien` (défaut) : lien interne du site (React Router), même onglet ;
 * - `nouvel-onglet` : lien interne en nouvel onglet (panneau « Je bloque » : l'exercice en cours reste ouvert) ;
 * - `texte` : texte seul (diapos de projection : un clic y fait « diapo suivante »).
 */
export type ModeLiens = 'lien' | 'nouvel-onglet' | 'texte'
export const ModeLiensChapitre = createContext<ModeLiens>('lien')

/** Lien nommé vers un chapitre / une étape (cible déjà résolue). Même texte à l'impression et dans
 * l'export (un `<a>` ordinaire : seul son texte est imprimé). Cible inconnue : texte seul (le build
 * l'interdit, `scripts/verifier-liens-chapitres.mjs`). */
function LienChapitre({ reference, section, texte }: { reference: string; section?: string; texte?: string }) {
  const mode = useContext(ModeLiensChapitre)
  const dansRouteur = useInRouterContext()
  const resolu = resoudreLien(reference, section, texte)
  const cible = resolu.cible
  const affiche = insecablesFr(resolu.texte)
  const titre = cible?.numero ? `Étape ${cible.numero} : ${cible.titreEtape}` : undefined
  if (!cible || mode === 'texte') return <>{affiche}</>
  if (mode === 'nouvel-onglet') {
    return (
      <a className="lien-chapitre" href={cible.href} target="_blank" rel="noopener" title={titre ? `${titre} (nouvel onglet)` : '(nouvel onglet)'}>
        {affiche}
      </a>
    )
  }
  return dansRouteur ? (
    <Link className="lien-chapitre" to={cible.href} title={titre}>
      {affiche}
    </Link>
  ) : (
    <a className="lien-chapitre" href={cible.href} title={titre}>
      {affiche}
    </a>
  )
}

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

type Morceau = { texte: string } | { tex: string; avant: string; apres: string } | { gras: string } | { lien: string; section?: string; choisi?: string }

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
    else if (match[3] !== undefined) morceaux.push({ lien: match[3], section: match[4], choisi: match[5] })
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
    else if ('lien' in m) parts.push(<LienChapitre key={key} reference={m.lien} section={m.section} texte={m.choisi} />)
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
