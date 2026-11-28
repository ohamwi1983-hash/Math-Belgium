/**
 * « Mots du cours » (français simple) — logique PURE, sans DOM : repérer dans un texte les formes du
 * lexique d'un chapitre (`ChapterContent.lexique`, voir `MotDuCours`).
 *
 * - Mots ENTIERS (jamais « mode » dans « modeste »), sans tenir compte de la casse ni des accents
 *   (« frequence » = « fréquence »), œ/æ, apostrophes et tirets typographiques ramenés à une seule forme ;
 * - la forme la plus longue gagne (« effectif cumulé » avant « effectif ») ;
 * - `pasDans` : une forme prise dans une expression du langage courant (« toute la classe », « en
 *   moyenne ») n'est pas repérée ;
 * - jamais dans une formule `$…$`, un `**gras**` ni un lien `[[…]]` : l'appelant (`RichText`) ne passe que
 *   les morceaux de texte simple, et `texteSimple` retire ces balises pour le calcul des propriétaires.
 *
 * Utilisé par `components/Math.tsx` (soulignés), `components/chapter/MotsDuCours.tsx` (bulle, lexique) et
 * `scripts/controle-lisibilite.mjs` (mots du cours absents du lexique).
 */

import type { MotDuCours } from '../content/types'

/** Texte normalisé + place, dans le texte d'origine, de chaque caractère normalisé. */
export interface TexteNormalise {
  n: string
  index: number[]
}

const REMPLACEMENTS: Record<string, string> = {
  'œ': 'oe', 'Œ': 'oe', 'æ': 'ae', 'Æ': 'ae', '’': "'", 'ʼ': "'", '‘': "'", ' ': ' ', ' ': ' ', ' ': ' ',
  '‑': '-', '‐': '-', '–': '-',
}

/** Minuscules, sans accents (NFD sans les marques), œ → oe, apostrophes droites, espaces simples. */
export function normaliser(texte: string): TexteNormalise {
  let n = ''
  const index: number[] = []
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i]
    const r = REMPLACEMENTS[c] ?? c.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    for (const x of r) {
      n += x
      index.push(i)
    }
  }
  return { n, index }
}

const echapper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export interface LexiqueCompile {
  mots: MotDuCours[]
  /** Toutes les formes, la plus longue d'abord. */
  re: RegExp | null
  /** Forme normalisée → indice du mot. */
  parForme: Map<string, number>
  /** Par mot : expressions normalisées où il ne faut pas le repérer. */
  pasDans: string[][]
}

/** Formes repérées d'un mot (le mot lui-même compris), dédoublonnées. */
export function formesDe(m: MotDuCours): string[] {
  return [...new Set([m.mot, ...(m.formes ?? [])].map((f) => f.trim()).filter(Boolean))]
}

export function compilerLexique(mots: MotDuCours[]): LexiqueCompile {
  const parForme = new Map<string, number>()
  mots.forEach((m, i) => {
    for (const f of formesDe(m)) {
      const n = normaliser(f).n.replace(/\s+/g, ' ')
      if (!parForme.has(n)) parForme.set(n, i)
    }
  })
  const formes = [...parForme.keys()].sort((a, b) => b.length - a.length)
  const re = formes.length
    ? new RegExp(`(?<![\\p{L}\\p{N}_])(?:${formes.map((f) => echapper(f).replace(/ /g, ' +')).join('|')})(?![\\p{L}\\p{N}_])`, 'gu')
    : null
  const pasDans = mots.map((m) => (m.pasDans ?? []).map((p) => normaliser(p).n.replace(/\s+/g, ' ')))
  return { mots, re, parForme, pasDans }
}

export interface Occurrence {
  /** Début et fin (exclue) dans le texte d'origine. */
  debut: number
  fin: number
  /** Indice du mot dans le lexique. */
  mot: number
}

/** Occurrences des mots du lexique dans un texte simple (sans formule), dans l'ordre, sans chevauchement. */
export function occurrences(lc: LexiqueCompile, texte: string): Occurrence[] {
  if (!lc.re || !texte) return []
  const { n, index } = normaliser(texte)
  const out: Occurrence[] = []
  lc.re.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = lc.re.exec(n)) !== null) {
    const a = m.index
    const b = a + m[0].length
    const mot = lc.parForme.get(m[0].replace(/ +/g, ' '))
    if (mot === undefined) continue
    // Expression du langage courant qui contient cette occurrence : on ne marque pas.
    const exclu = lc.pasDans[mot].some((p) => {
      let k = n.indexOf(p)
      while (k >= 0) {
        if (k < b && k + p.length > a) return true
        k = n.indexOf(p, k + 1)
      }
      return false
    })
    if (exclu) continue
    out.push({ debut: index[a], fin: index[b - 1] + 1, mot })
  }
  return out
}

/** Le texte simple d'une chaîne RichText : formules, gras et liens nommés remplacés par une espace. */
export function texteSimple(texte: string): string {
  return texte.replace(/\$[^$]+\$|\*\*[^*]+\*\*|\[\[[^\]]+\]\]/g, ' ')
}

/**
 * « Une fois par bloc » : pour chaque mot, la PREMIÈRE chaîne du bloc (dans l'ordre de lecture) qui le
 * contient en texte simple — seule celle-ci le marque. Calcul pur, à partir des données : le même
 * résultat au pré-rendu, à chaque rendu et quel que soit le morceau du bloc qui se redessine.
 */
export function proprietaires(lc: LexiqueCompile, textes: string[]): Map<number, string> {
  const out = new Map<number, string>()
  for (const t of textes) for (const o of occurrences(lc, texteSimple(t))) if (!out.has(o.mot)) out.set(o.mot, t)
  return out
}

/** Champs d'un bloc rendus par `RichText` ET où les mots peuvent être marqués (pas les légendes de
 * figures, les tableaux, les titres, les étiquettes). Ordre des clés = ordre de lecture. */
const CHAMPS_TEXTE = new Set(['text', 'items', 'formula', 'steps', 'result', 'blocks', 'question', 'reponse'])

/** Chaînes d'un bloc de contenu (ou de toute valeur), dans l'ordre de lecture. */
export function textesDuBloc(valeur: unknown, out: string[] = []): string[] {
  if (typeof valeur === 'string') out.push(valeur)
  else if (Array.isArray(valeur)) for (const v of valeur) textesDuBloc(v, out)
  else if (valeur && typeof valeur === 'object') {
    for (const [k, v] of Object.entries(valeur)) if (CHAMPS_TEXTE.has(k)) textesDuBloc(v, out)
  }
  return out
}

/** Lexique trié par ordre alphabétique (français, sans tenir compte des accents ni de la casse). */
export function lexiqueAlphabetique(mots: MotDuCours[]): MotDuCours[] {
  return [...mots].sort((a, b) => a.mot.localeCompare(b.mot, 'fr', { sensitivity: 'base' }))
}
