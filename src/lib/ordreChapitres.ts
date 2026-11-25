/**
 * « Mon ordre des chapitres » (décision du 25/11/2026, `supabase/migrations/0011_ordre_chapitres.sql`).
 *
 * Deux règles, une seule source pour tout le site :
 * - ce que voient les ÉLÈVES (documents imprimés et Word, diapositives, export du cours, page de
 *   classe, texte pour l'agenda scolaire, assistant élève) ne porte JAMAIS le numéro de chapitre du
 *   site : le titre seul, ou le numéro du PROFESSEUR s'il a rangé les chapitres de cette année
 *   (`numeroAffiche`, `libelleChapitre`) ;
 * - les outils du professeur (carnet, coffre, page de conception) rangent les chapitres dans SON
 *   ordre (`chapitresDansMonOrdre`) et montrent son numéro, à défaut celui du site comme simple
 *   repère (`numeroRepere`).
 *
 * Un chapitre absent du rangement (ajouté au site plus tard) vient à la fin, dans l'ordre du site ;
 * un slug inconnu du rangement (chapitre retiré) est ignoré. Le numéro du site (`chapterNumber`)
 * reste un repère du site public (accueil, page de chapitre, recherche, Mon suivi, plan).
 *
 * L'ordre du professeur connecté est gardé ici (`ordreCourant`, lu par `CompteProvider`) : les
 * modules de documents, purs et sans React, le lisent sans qu'on l'injecte partout. Visiteur, élève
 * ou migration absente : `null` → ordre du site, titres seuls.
 */
import { useSyncExternalStore } from 'react'
import { LEVELS } from '../content/chaptersIndex'

/** Rangement par année : `{ "4e": ["geometrie-dans-espace", …], … }` ; une année absente = ordre du site. */
export type RangementChapitres = Partial<Record<string, string[]>>

export interface OrdreChapitres {
  niveaux: RangementChapitres
  /** Faux : « Ne pas numéroter mes documents » (titre seul même avec un ordre réglé). */
  numeroter: boolean
}

/** Ce dont les fonctions ont besoin d'un chapitre (un `ChapterContent` convient). */
export interface ChapitreRepere {
  slug: string
  levelSlug: string
  title: string
  chapterNumber: number
}

export const NIVEAUX_MAX = 8
export const CHAPITRES_MAX = 40
const MOTIF_NIVEAU = /^[a-z0-9][a-z0-9-]{0,19}$/
const MOTIF_SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/

/** Lecture TOLÉRANTE de la colonne (même règle que la contrainte SQL `ordre_chapitres_valide`) :
 * tout ce qui ne la respecte pas est ignoré, jamais une erreur. */
export function lireRangement(brut: unknown): RangementChapitres {
  const res: RangementChapitres = {}
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) return res
  let n = 0
  for (const [niveau, liste] of Object.entries(brut as Record<string, unknown>)) {
    if (n >= NIVEAUX_MAX) break
    if (!MOTIF_NIVEAU.test(niveau) || !Array.isArray(liste) || liste.length === 0 || liste.length > CHAPITRES_MAX) continue
    const slugs = liste.filter((s): s is string => typeof s === 'string' && MOTIF_SLUG.test(s))
    if (slugs.length !== liste.length || new Set(slugs).size !== slugs.length) continue
    res[niveau] = slugs
    n++
  }
  return res
}

/** Vrai si le professeur a rangé les chapitres de cette année. */
export function ordreRegle(levelSlug: string, ordre: OrdreChapitres | null | undefined): boolean {
  return !!ordre && (ordre.niveaux[levelSlug]?.length ?? 0) > 0
}

/** Chapitres d'une année dans l'ordre du professeur (ordre du site sans rangement) ; absents du
 * rangement → à la fin, dans l'ordre du site. */
export function chapitresDansMonOrdre<C extends ChapitreRepere>(levelSlug: string, ordre: OrdreChapitres | null | undefined, chapitres?: C[]): C[] {
  const site = (chapitres ?? (LEVELS.find((l) => l.slug === levelSlug)?.chapters as unknown as C[] | undefined) ?? []).slice()
  const liste = ordre?.niveaux[levelSlug]
  if (!liste || liste.length === 0) return site
  const rang = new Map(liste.map((s, i) => [s, i]))
  return site
    .map((c, i) => ({ c, i }))
    .sort((a, b) => (rang.get(a.c.slug) ?? CHAPITRES_MAX + a.i) - (rang.get(b.c.slug) ?? CHAPITRES_MAX + b.i))
    .map((x) => x.c)
}

/** Rang (1, 2…) du chapitre dans l'ordre du professeur, `null` sans rangement de cette année. */
function rangProfesseur(chapitre: ChapitreRepere, ordre: OrdreChapitres | null | undefined): number | null {
  if (!ordreRegle(chapitre.levelSlug, ordre)) return null
  const i = chapitresDansMonOrdre(chapitre.levelSlug, ordre).findIndex((c) => c.slug === chapitre.slug)
  return i < 0 ? null : i + 1
}

/** Numéro imprimé sur ce que voient les élèves : celui du professeur (ordre réglé pour cette année,
 * documents numérotés), sinon `null` (titre seul). JAMAIS le numéro du site. */
export function numeroAffiche(chapitre: ChapitreRepere, ordre: OrdreChapitres | null | undefined = ordreCourant()): number | null {
  if (!ordre || !ordre.numeroter) return null
  return rangProfesseur(chapitre, ordre)
}

/** Numéro montré au PROFESSEUR dans ses outils : le sien s'il a rangé l'année, sinon celui du site
 * (simple repère, comme sur le site public). Jamais imprimé côté élève. */
export function numeroRepere(chapitre: ChapitreRepere, ordre: OrdreChapitres | null | undefined = ordreCourant()): number {
  return rangProfesseur(chapitre, ordre) ?? chapitre.chapterNumber
}

/** « Chapitre 3 — Titre » (numéro du professeur) ou « Titre » — pour tout ce que voient les élèves.
 * `titre` remplace le titre du chapitre (titre en texte brut, titre court…). */
export function libelleChapitre(chapitre: ChapitreRepere, ordre: OrdreChapitres | null | undefined = ordreCourant(), options: { titre?: string } = {}): string {
  const titre = options.titre ?? chapitre.title
  const n = numeroAffiche(chapitre, ordre)
  return n === null ? titre : `Chapitre ${n} — ${titre}`
}

/** Surtitre d'un document d'un seul chapitre : « 4e · Chapitre 3 — Titre » ou « 4e · Titre ». */
export function surtitreChapitre(niveauLabel: string, chapitre: ChapitreRepere, ordre: OrdreChapitres | null | undefined = ordreCourant(), options: { titre?: string } = {}): string {
  return `${niveauLabel} · ${libelleChapitre(chapitre, ordre, options)}`
}

/** Préfixe d'un titre de section d'un document multi-chapitres : « 3. Titre » ou « Titre ». */
export function prefixeChapitre(chapitre: ChapitreRepere, ordre: OrdreChapitres | null | undefined = ordreCourant()): string {
  const n = numeroAffiche(chapitre, ordre)
  return n === null ? chapitre.title : `${n}. ${chapitre.title}`
}

/**
 * Titre de section imprimé (copie, corrigé, Word…). Les plans stockent la forme d'origine,
 * « 8. Titre du chapitre — 2. Section » (numéro du SITE) dès qu'ils couvrent plusieurs chapitres :
 * elle est réécrite AU RENDU (numéro du professeur qui imprime, ou titre seul) — le plan enregistré,
 * partagé ou rouvert par QR ne change pas. Tout autre titre est rendu tel quel.
 */
export function titreSectionImprime(titreSection: string, chapitreSlug: string | undefined, ordre: OrdreChapitres | null | undefined = ordreCourant()): string {
  if (!chapitreSlug) return titreSection
  for (const l of LEVELS) {
    const c = l.chapters.find((x) => x.slug === chapitreSlug)
    if (!c) continue
    const prefixeSite = `${c.chapterNumber}. ${c.title} — `
    if (titreSection.startsWith(prefixeSite)) return `${prefixeChapitre(c, ordre)} — ${titreSection.slice(prefixeSite.length)}`
  }
  return titreSection
}

/** Rangement à enregistrer pour une année (slugs de l'année seulement, sans doublon). */
export function rangementNormalise(levelSlug: string, slugs: string[]): string[] {
  const connus = new Set((LEVELS.find((l) => l.slug === levelSlug)?.chapters ?? []).map((c) => c.slug))
  return [...new Set(slugs)].filter((s) => connus.has(s))
}

/** Vrai si le rangement donne exactement l'ordre du site. */
export function estOrdreDuSite(levelSlug: string, slugs: string[]): boolean {
  const site = (LEVELS.find((l) => l.slug === levelSlug)?.chapters ?? []).map((c) => c.slug)
  return site.length === slugs.length && site.every((s, i) => s === slugs[i])
}

/* ------------------------------------------------------------------ ordre du professeur connecté */

/**
 * `sans-compte` : visiteur, élève, Supabase non configuré ; `chargement` : lecture en cours ;
 * `absente` : migration 0011 pas appliquée (ordre du site, titres seuls) ; `active` : lue (ordre
 * `null` = aucun réglage).
 */
export type EtatOrdreChapitres =
  | { etat: 'sans-compte' | 'chargement' | 'absente'; ordre: null }
  | { etat: 'active'; ordre: OrdreChapitres | null }

let courant: EtatOrdreChapitres = { etat: 'sans-compte', ordre: null }
const abonnes = new Set<() => void>()

export function etatOrdreChapitres(): EtatOrdreChapitres {
  return courant
}

/** Ordre du professeur connecté (`null` : aucun, ordre du site). */
export function ordreCourant(): OrdreChapitres | null {
  return courant.ordre
}

export function definirEtatOrdreChapitres(e: EtatOrdreChapitres): void {
  courant = e
  for (const f of abonnes) f()
}

function abonner(f: () => void): () => void {
  abonnes.add(f)
  return () => abonnes.delete(f)
}

/** État de l'ordre du professeur connecté, re-rendu quand il change. */
export function useOrdreChapitres(): EtatOrdreChapitres {
  return useSyncExternalStore(abonner, etatOrdreChapitres, etatOrdreChapitres)
}
