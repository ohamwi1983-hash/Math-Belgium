import { LEVELS } from '../content/chaptersIndex'
import type { ChapterContent, ChapterSection } from '../content/types'

/**
 * Lien NOMMÉ vers un autre chapitre (ou une autre étape) — chapitres autonomes, décision du professeur
 * du 25/11/2026 : les professeurs ne suivent pas tous l'ordre du site, donc le texte du cours ne dit
 * jamais « au chapitre 2 » / « au chapitre précédent », mais nomme ce qu'il cite.
 *
 * Syntaxe de contenu (champs RichText seulement — voir `.claude/rules/content-authoring.md`) :
 * - `[[4e/equations-inequations-second-degre#resoudre]]` → « Équations et inéquations du second degré », étape 1
 * - `[[4e/geometrie-analytique-plane]]` → « Géométrie analytique plane »
 * - `[[4e/calcul-vectoriel#norme|la norme]]` → « la norme » (texte choisi)
 *
 * Résolution par `chaptersIndex.ts` ; une cible inconnue fait ÉCHOUER le build
 * (`scripts/verifier-liens-chapitres.mjs`). Même référence (`niveau/slug#section`) pour les entrées
 * `utilise` des sections (encadré « Ce chapitre utilise… »).
 */

/** Motif d'un lien nommé (global : à remettre à zéro, `lastIndex = 0`, avant chaque usage en boucle). */
export const LIEN_CHAPITRE_RE = /\[\[([^\]|#]+?)(?:#([^\]|]+?))?(?:\|([^\]]+?))?\]\]/g

export interface CibleResolue {
  chapitre: ChapterContent
  /** Absent : lien vers le chapitre entier (sa carte). */
  section?: ChapterSection
  /** Numéro de l'étape dans le parcours (1 = première section). */
  numero?: number
  /** Adresse interne : `/4e/slug` ou `/4e/slug#section`. */
  href: string
  /** Texte affiché par défaut : « « Titre », étape n » ou « « Titre » ». */
  libelle: string
  /** Titre court de l'étape (texte brut) — info-bulle et lecteurs d'écran. */
  titreEtape?: string
}

/** « niveau/slug#section » → ses morceaux (`null` si la forme est fausse). */
export function decouperReference(reference: string): { niveau: string; slug: string; section?: string } | null {
  const m = /^([^/#|\s]+)\/([^/#|\s]+)(?:#([^/#|\s]+))?$/.exec(reference.trim())
  return m ? { niveau: m[1], slug: m[2], section: m[3] } : null
}

const cache = new Map<string, CibleResolue | null>()

/** Résout une référence `niveau/slug[#section]` (null si chapitre ou étape inconnus). */
export function resoudreReference(reference: string): CibleResolue | null {
  const deja = cache.get(reference)
  if (deja !== undefined) return deja
  let res: CibleResolue | null = null
  const r = decouperReference(reference)
  const chapitre = r ? LEVELS.find((l) => l.slug === r.niveau)?.chapters.find((c) => c.slug === r.slug) : undefined
  if (r && chapitre) {
    const base = `/${chapitre.levelSlug}/${chapitre.slug}`
    if (!r.section) res = { chapitre, href: base, libelle: `« ${chapitre.title} »` }
    else {
      const index = chapitre.sections.findIndex((s) => s.id === r.section)
      if (index >= 0) {
        const section = chapitre.sections[index]
        res = {
          chapitre,
          section,
          numero: index + 1,
          href: `${base}#${section.id}`,
          libelle: `« ${chapitre.title} », point ${index + 1}`,
          titreEtape: section.titreCourt ?? section.title.replace(/\$([^$]+)\$/g, '$1'),
        }
      }
    }
  }
  cache.set(reference, res)
  return res
}

/** Une référence `[[…]]` reconnue dans un texte : sa cible (ou `null`) et son texte choisi. */
export function resoudreLien(reference: string, section: string | undefined, texte: string | undefined): { cible: CibleResolue | null; texte: string } {
  const cible = resoudreReference(section ? `${reference}#${section}` : reference)
  return { cible, texte: texte?.trim() || cible?.libelle || reference }
}

/** Texte BRUT : chaque lien nommé remplacé par son texte (export papier, notes, méta, recherche). */
export function texteSansLiens(texte: string): string {
  if (!texte.includes('[[')) return texte
  return texte.replace(LIEN_CHAPITRE_RE, (_, ref: string, section: string | undefined, choisi: string | undefined) => resoudreLien(ref, section, choisi).texte)
}

/** Toutes les références `[[…]]` d'un texte (contrôle du build). */
export function referencesDe(texte: string): string[] {
  const res: string[] = []
  LIEN_CHAPITRE_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = LIEN_CHAPITRE_RE.exec(texte)) !== null) res.push(m[2] ? `${m[1]}#${m[2]}` : m[1])
  return res
}
