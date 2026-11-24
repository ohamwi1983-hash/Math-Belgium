import { useCallback, useEffect, useState } from 'react'
import type { Block, ChapterContent, ChapterSection } from '../content/types'

/**
 * Parcours d'un chapitre (page de chapitre « une étape par écran », voir `ChapterPage`) :
 * progression de l'élève, cartes « Teste-toi » et durée estimée des étapes.
 *
 * Progression et cartes vivent dans le `localStorage` du navigateur (une clé par chapitre) : rien
 * n'est envoyé au serveur. Chaque accès est protégé (navigation privée, stockage bloqué ou plein,
 * aperçu sans stockage) : la page reste correcte avec une progression vide.
 */

export interface EtatParcours {
  /** Identifiants des sections marquées « J'ai compris ». */
  lues: string[]
  /** Dernière étape ouverte (bouton « Reprendre »). */
  derniere: string | null
}

export type EtatCarte = 'su' | 'revoir'

function lireJson(cle: string): unknown {
  try {
    const brut = window.localStorage.getItem(cle)
    return brut ? JSON.parse(brut) : null
  } catch {
    return null
  }
}

function ecrireJson(cle: string, valeur: unknown): void {
  try {
    window.localStorage.setItem(cle, JSON.stringify(valeur))
  } catch {
    // Stockage indisponible : la progression reste en mémoire le temps de la visite.
  }
}

const cleParcours = (c: ChapterContent) => `parcours:${c.levelSlug}/${c.slug}`
const cleCartes = (c: ChapterContent) => `cartes:${c.levelSlug}/${c.slug}`

/** Clé GLOBALE « dernière étape ouverte », une entrée par année (bandeau « Reprendre » de la page
 * d'accueil) : `{ "4e": { chapitre, section, quand }, … }`. Écrite à chaque ouverture d'étape, à côté
 * de la clé du chapitre (inchangée). */
const CLE_DERNIERE_ETAPE = 'parcours:derniere-etape'

export interface DerniereEtape {
  chapitre: string
  section: string
  /** `Date.now()` de l'ouverture. */
  quand: number
}

/** Dernière étape ouverte par année (`levelSlug`), entrées malformées ignorées. */
export function lireDernieresEtapes(): Record<string, DerniereEtape> {
  const v = lireJson(CLE_DERNIERE_ETAPE)
  const res: Record<string, DerniereEtape> = {}
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const [niveau, e] of Object.entries(v as Record<string, Partial<DerniereEtape> | null>)) {
      if (e && typeof e.chapitre === 'string' && typeof e.section === 'string' && typeof e.quand === 'number') res[niveau] = { chapitre: e.chapitre, section: e.section, quand: e.quand }
    }
  }
  return res
}

function noterDerniereEtape(c: ChapterContent, section: string): void {
  ecrireJson(CLE_DERNIERE_ETAPE, { ...lireDernieresEtapes(), [c.levelSlug]: { chapitre: c.slug, section, quand: Date.now() } })
}

/** Progression d'un chapitre lue sans s'abonner (page d'accueil). */
export function lireParcours(c: ChapterContent): EtatParcours {
  const v = lireJson(cleParcours(c)) as Partial<EtatParcours> | null
  const ids = new Set(c.sections.map((s) => s.id))
  return {
    lues: Array.isArray(v?.lues) ? v.lues.filter((s): s is string => typeof s === 'string' && ids.has(s)) : [],
    derniere: typeof v?.derniere === 'string' && ids.has(v.derniere) ? v.derniere : null,
  }
}

/** Progression du chapitre : étapes lues et dernière étape ouverte. */
export function useParcours(chapter: ChapterContent) {
  const [etat, setEtat] = useState<EtatParcours>(() => lireParcours(chapter))

  useEffect(() => {
    setEtat(lireParcours(chapter))
  }, [chapter])

  const modifier = useCallback(
    (f: (e: EtatParcours) => EtatParcours) => {
      setEtat((e) => {
        const suivant = f(e)
        if (suivant !== e) ecrireJson(cleParcours(chapter), suivant)
        return suivant
      })
    },
    [chapter],
  )

  const ouvrir = useCallback(
    (id: string) => {
      noterDerniereEtape(chapter, id)
      modifier((e) => (e.derniere === id ? e : { ...e, derniere: id }))
    },
    [chapter, modifier],
  )
  const marquer = useCallback(
    (id: string, lue: boolean) =>
      modifier((e) => {
        const deja = e.lues.includes(id)
        if (deja === lue) return e
        return { ...e, lues: lue ? [...e.lues, id] : e.lues.filter((x) => x !== id) }
      }),
    [modifier],
  )
  return { etat, ouvrir, marquer }
}

/** État des cartes « Teste-toi » (« Je savais » / « À revoir »), clé `idSection:indice`. */
export function useEtatCartes(chapter: ChapterContent) {
  const [etats, setEtats] = useState<Record<string, EtatCarte>>(() => lireEtatsCartes(chapter))
  useEffect(() => {
    setEtats(lireEtatsCartes(chapter))
  }, [chapter])
  const noter = useCallback(
    (cle: string, etat: EtatCarte) =>
      setEtats((e) => {
        const suivant = { ...e, [cle]: etat }
        ecrireJson(cleCartes(chapter), suivant)
        return suivant
      }),
    [chapter],
  )
  const effacer = useCallback(() => {
    setEtats({})
    ecrireJson(cleCartes(chapter), {})
  }, [chapter])
  return { etats, noter, effacer }
}

function lireEtatsCartes(c: ChapterContent): Record<string, EtatCarte> {
  const v = lireJson(cleCartes(c))
  const res: Record<string, EtatCarte> = {}
  if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) if (x === 'su' || x === 'revoir') res[k] = x
  }
  return res
}

/** Titre affiché sur la carte, les boutons de navigation et la fiche. */
export const titreCourt = (s: ChapterSection) => insecables(s.titreCourt ?? s.title)

/** Espace insécable devant « ? ! : ; » (typographie française) : jamais de « ? » seul à la ligne. */
export const insecables = (t: string) => t.replace(/ ([?!:;»])/g, '\u00a0$1')

/** Première lettre en minuscule (« tu as vu : multiplier par un réel »), sauf sigle (« PGCD »). */
export function minusculeInitiale(t: string): string {
  if (t.length > 1 && t[1] === t[1].toUpperCase() && t[1] !== t[1].toLowerCase()) return t
  return t.charAt(0).toLowerCase() + t.slice(1)
}

// ---------- durée estimée ----------

/** Mots d'un texte RichText : une formule `$…$` compte pour un mot. */
function compterMots(texte: string | undefined): number {
  if (!texte) return 0
  return texte
    .replace(/\$[^$]+\$/g, ' x ')
    .replace(/\*\*/g, '')
    .split(/\s+/)
    .filter(Boolean).length
}

export function textesBloc(b: Block): (string | undefined)[] {
  switch (b.kind) {
    case 'para':
    case 'subheading':
    case 'piege':
    case 'intuition':
      return [b.text]
    case 'attention':
    case 'astuce':
      return [b.text, ...(b.items ?? [])]
    case 'list':
    case 'rappel':
    case 'methode':
    case 'definition':
      return b.items
    case 'historique':
      return [b.titre, b.text]
    case 'application':
      return [b.titre, b.text]
    case 'exemple':
      return [b.formula, ...b.steps.flatMap((s) => [s.tag, s.text]), b.result.tag, b.result.text, b.illustration && 'caption' in b.illustration ? (b.illustration.caption as string) : undefined]
    case 'exempleLibre':
      return b.blocks.flatMap(textesBloc)
    case 'wrongRight':
      return [b.wrong, b.right]
    case 'illustration':
      return ['caption' in b.illustration ? (b.illustration.caption as string) : undefined]
    case 'illustrationGroup':
      return b.items.map((it) => ('caption' in it ? (it.caption as string) : undefined))
    case 'atelier':
      return [b.caption]
    case 'signTable':
      return [b.caption]
    case 'featureTable':
      return [b.caption, ...b.headers, ...b.rows.flat().map((c) => (typeof c === 'string' ? c : c.text))]
    case 'operationChain':
      return [...b.nodes, ...b.operations]
    case 'entrainement':
    case 'video':
      return []
  }
}

/** Durée estimée d'une étape, en minutes : mots / 180 par minute + 1 min par atelier, arrondie
 * (au moins 1). Calculée, jamais saisie dans le contenu. */
export function dureeEtape(blocks: Block[]): number {
  const mots = blocks.flatMap(textesBloc).reduce((n, t) => n + compterMots(t), 0)
  const ateliers = blocks.filter((b) => b.kind === 'atelier').length
  return Math.max(1, Math.round(mots / 180 + ateliers))
}
