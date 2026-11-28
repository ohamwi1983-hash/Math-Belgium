import { createContext, useContext, useMemo } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import type { MotDuCours } from '../content/types'
import type { LexiqueCompile } from '../lib/motsDuCours'
import { compilerLexique, occurrences, proprietaires, textesDuBloc } from '../lib/motsDuCours'

/**
 * « Mots du cours » — contexte et mot souligné (le reste : `components/chapter/MotsDuCours.tsx`).
 *
 * `FournisseurMotsDuCours` (posé par `ChapterPage` quand le chapitre a un `lexique`) active le repérage
 * dans tous les `RichText` du chapitre ; `SansMotsDuCours` le coupe (titres, tableaux, figures,
 * formulaire, lede, prérequis d'autres chapitres, la bulle et le lexique eux-mêmes) ; `PorteeMots`
 * délimite un bloc : un mot n'y est marqué qu'une fois (dans la première chaîne qui le contient). Hors
 * de tout fournisseur (générateurs, projection, carnet, panneau des évaluations…) : rien ne change.
 */

export interface ContexteMots {
  lc: LexiqueCompile
  /** Faux sous `SansMotsDuCours`. */
  actif: boolean
  /** Bloc courant : mot → la chaîne qui le marque. Absent : une fois par chaîne `RichText`. */
  portee: Map<number, string> | null
}

const Contexte = createContext<ContexteMots | null>(null)

export function useMotsDuCours(): ContexteMots | null {
  return useContext(Contexte)
}

export function FournisseurMotsDuCours({ lexique, children }: { lexique?: MotDuCours[]; children: ReactNode }) {
  const valeur = useMemo<ContexteMots | null>(() => (lexique && lexique.length ? { lc: compilerLexique(lexique), actif: true, portee: null } : null), [lexique])
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>
}

export function SansMotsDuCours({ children }: { children: ReactNode }) {
  const ctx = useContext(Contexte)
  const valeur = useMemo(() => (ctx && ctx.actif ? { ...ctx, actif: false } : ctx), [ctx])
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>
}

/** Un bloc de contenu (ou toute valeur : phrases de l'essentiel, carte question / réponse) : chaque mot
 * n'y est souligné qu'une fois. Un bloc imbriqué (paragraphe d'un exemple libre) garde la portée de son
 * parent. */
export function PorteeMots({ valeur, children }: { valeur: unknown; children: ReactNode }) {
  const ctx = useContext(Contexte)
  const dejaPortee = !!ctx?.portee
  const nouvelle = useMemo(
    () => (ctx && ctx.actif && !dejaPortee ? { ...ctx, portee: proprietaires(ctx.lc, textesDuBloc(valeur)) } : ctx),
    [ctx, dejaPortee, valeur],
  )
  if (!ctx || dejaPortee) return <>{children}</>
  return <Contexte.Provider value={nouvelle}>{children}</Contexte.Provider>
}

// ---------------------------------------------------------------------------------------------
// Bulle ouverte : petit magasin hors React (ouvrir une bulle ne redessine aucun texte du cours).
// ---------------------------------------------------------------------------------------------

export interface MotOuvert {
  mot: number
  /** Le mot souligné touché (place de la bulle, focus rendu à la fermeture). */
  el: HTMLElement
}

let ouvert: MotOuvert | null = null
const abonnes = new Set<() => void>()

export function motOuvert(): MotOuvert | null {
  return ouvert
}

export function abonnerMotOuvert(f: () => void): () => void {
  abonnes.add(f)
  return () => abonnes.delete(f)
}

/** Ouvre (ou referme, si c'est le même) la bulle d'un mot. `aria-expanded` est posé directement sur le
 * mot souligné : React n'y touche plus après le premier rendu (valeur toujours « false » côté React). */
export function basculerMot(mot: number, el: HTMLElement) {
  const meme = ouvert?.el === el
  fermerMot(false)
  if (meme) return
  ouvert = { mot, el }
  el.setAttribute('aria-expanded', 'true')
  abonnes.forEach((f) => f())
}

export function fermerMot(rendreFocus: boolean) {
  if (!ouvert) return
  const el = ouvert.el
  el.setAttribute('aria-expanded', 'false')
  ouvert = null
  abonnes.forEach((f) => f())
  if (rendreFocus && el.isConnected) el.focus({ preventScroll: true })
}

/** Mot souligné : `span` au rôle de bouton (un `<button>` ne se coupe pas en fin de ligne, « boîte à
 * moustaches » doit pouvoir passer à la ligne comme le reste du texte). Lu normalement par la lecture à
 * voix haute (`phrasesPage.ts` ne saute que les vrais boutons). */
function MotSouligne({ mot, children }: { mot: number; children: string }) {
  const ouvrir = (e: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => {
    e.preventDefault()
    e.stopPropagation()
    basculerMot(mot, e.currentTarget)
  }
  return (
    <span
      className="mot-cours"
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded="false"
      aria-label={`${children} : voir la définition`}
      data-mot={mot}
      onClick={ouvrir}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') ouvrir(e)
      }}
    >
      {children}
    </span>
  )
}

/** Découpe un morceau de texte simple de `RichText` : mots du cours soulignés (une fois par chaîne, et
 * seulement dans la chaîne propriétaire du bloc), le reste tel quel. `deja` : mots déjà marqués dans la
 * même chaîne. */
export function marquerMots(ctx: ContexteMots | null, texte: string, chaine: string, deja: Set<number>, cle: string): ReactNode[] | null {
  if (!ctx || !ctx.actif || !texte) return null
  const occ = occurrences(ctx.lc, texte).filter((o) => {
    if (deja.has(o.mot)) return false
    if (ctx.portee && ctx.portee.get(o.mot) !== chaine) return false
    deja.add(o.mot)
    return true
  })
  if (!occ.length) return null
  const out: ReactNode[] = []
  let pos = 0
  occ.forEach((o, i) => {
    if (o.debut > pos) out.push(texte.slice(pos, o.debut))
    out.push(
      <MotSouligne key={`${cle}-${i}`} mot={o.mot}>
        {texte.slice(o.debut, o.fin)}
      </MotSouligne>,
    )
    pos = o.fin
  })
  if (pos < texte.length) out.push(texte.slice(pos))
  return out
}
