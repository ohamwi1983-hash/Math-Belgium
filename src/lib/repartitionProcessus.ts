import type { Processus } from './evaluationPayload'

/**
 * Répartition de l'EXAMEN entre les processus Connaître / Appliquer / Transférer — répartition de
 * l'utilisateur, 25 / 50 / 25 (décisions du 22/11/2026). Elle ne vaut QUE pour l'examen : « Préparer
 * l'examen » de la page de conception (`components/admin/conception/composer.ts`, mode examen du
 * panneau) et le texte de sa carte (`texteRepartition`). Ne jamais recopier ces nombres ailleurs (ni
 * dans l'interface élève, ni dans la documentation).
 *
 * Évaluations et feuilles d'exercices (panneau professeur) et feuille d'exercices de l'élève : AUCUNE
 * répartition imposée — le temps est partagé à parts égales entre les compétences cochées
 * (`partageEgal`), le professeur pouvant ajuster pour le document seulement (`ajusterParts`, jamais
 * mémorisé). Évaluation blanche de l'élève : parts tirées au hasard ou réglées (fin de fichier).
 *
 * Réglable par le professeur (décision de l'utilisateur, 22/11/2026) : « Préparer l'examen » seulement,
 * valeur mémorisée dans `profils.repartition` (`supabase/migrations/0005_repartition.sql`, NULL = ce
 * défaut : c'est sa répartition d'EXAMEN) — voir `RepartitionPourcents`.
 */
export const REPARTITION_PROCESSUS: Readonly<Record<Processus, number>> = { 1: 0.25, 2: 0.5, 3: 0.25 }

/** Répartition en pourcentages entiers (0–100, somme 100) — forme stockée dans `profils.repartition`
 * (mêmes clés, mêmes règles que la contrainte `profils_repartition_valide` de 0005). */
export interface RepartitionPourcents {
  connaitre: number
  appliquer: number
  transferer: number
}

export const CLES_REPARTITION = ['connaitre', 'appliquer', 'transferer'] as const
export type CleRepartition = (typeof CLES_REPARTITION)[number]
export const PROCESSUS_DE_CLE: Readonly<Record<CleRepartition, Processus>> = { connaitre: 1, appliquer: 2, transferer: 3 }
export const LIBELLE_CLE: Readonly<Record<CleRepartition, string>> = { connaitre: 'Connaître', appliquer: 'Appliquer', transferer: 'Transférer' }
/** Pas des boutons − / + du réglage (le stockage accepte tout entier). */
export const PAS_REPARTITION = 5

/** Défaut en pourcentages, tiré de `REPARTITION_PROCESSUS` (aucun nombre recopié). */
export const REPARTITION_DEFAUT: Readonly<RepartitionPourcents> = Object.freeze({
  connaitre: Math.round(REPARTITION_PROCESSUS[1] * 100),
  appliquer: Math.round(REPARTITION_PROCESSUS[2] * 100),
  transferer: Math.round(REPARTITION_PROCESSUS[3] * 100),
})

/** Même règle que la contrainte SQL : objet à exactement ces trois clés, entiers 0–100, somme 100. */
export function repartitionValide(x: unknown): x is RepartitionPourcents {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false
  const cles = Object.keys(x)
  if (cles.length !== 3 || !CLES_REPARTITION.every((c) => cles.includes(c))) return false
  const v = x as Record<string, unknown>
  if (!CLES_REPARTITION.every((c) => typeof v[c] === 'number' && Number.isInteger(v[c]) && (v[c] as number) >= 0 && (v[c] as number) <= 100)) return false
  return CLES_REPARTITION.reduce((t, c) => t + (v[c] as number), 0) === 100
}

export function memeRepartition(a: RepartitionPourcents, b: RepartitionPourcents): boolean {
  return CLES_REPARTITION.every((c) => a[c] === b[c])
}

export const estRepartitionDefaut = (r: RepartitionPourcents) => memeRepartition(r, REPARTITION_DEFAUT)

/** Fractions par processus (somme 1), forme lue par `composer.ts`. */
export function fractionsRepartition(r: RepartitionPourcents = REPARTITION_DEFAUT): Record<Processus, number> {
  return { 1: r.connaitre / 100, 2: r.appliquer / 100, 3: r.transferer / 100 }
}

/** Pourcentages de la répartition, dans l'ordre Connaître / Appliquer / Transférer. */
export function pourcentsRepartition(r: RepartitionPourcents = REPARTITION_DEFAUT): number[] {
  return CLES_REPARTITION.map((c) => r[c])
}

/** « 25 % / 50 % / 25 % » (`compact` : « 25 / 50 / 25 % ») ; espace insécable avant « % » (jamais
 * « 25 » en fin de ligne et « % » au début de la suivante). */
export function texteRepartition(compact = false, r: RepartitionPourcents = REPARTITION_DEFAUT): string {
  const pc = pourcentsRepartition(r)
  return compact ? `${pc.join(' / ')}\u00a0%` : pc.map((n) => `${n}\u00a0%`).join(' / ')
}

/**
 * Bouton − / + du réglage : la valeur de `cle` change de `delta` (multiple de `PAS_REPARTITION`) et
 * le total reste 100 — Appliquer compense quand on règle Connaître ou Transférer (même idée que « la
 * part d'un processus absent passe à Appliquer ») ; quand on règle Appliquer, l'autre compétence qui
 * compense est la plus grande (on lui reprend) ou la plus petite (on lui donne), Transférer d'abord
 * à égalité pour reprendre, Connaître d'abord pour donner. Si Appliquer ne peut plus compenser (0 %
 * pour une hausse), l'autre compétence compense. Renvoie `null` si le changement est impossible
 * (borne 0 / 100 atteinte, plus rien à reprendre) : le bouton est alors désactivé.
 */
export function ajusterRepartition(r: RepartitionPourcents, cle: CleRepartition, delta: number): RepartitionPourcents | null {
  const cible = r[cle] + delta
  if (delta === 0 || cible < 0 || cible > 100) return null
  const autres = CLES_REPARTITION.filter((c) => c !== cle)
  let ordre: CleRepartition[]
  if (cle === 'appliquer') {
    const [a, b] = autres // connaitre, transferer
    if (delta > 0) ordre = r[b] >= r[a] ? [b, a] : [a, b]
    else ordre = r[a] <= r[b] ? [a, b] : [b, a]
  } else {
    ordre = ['appliquer', autres.find((c) => c !== 'appliquer')!]
  }
  // Hausse : on reprend à la première qui a assez ; baisse : on donne à la première (jamais > 100).
  const compense = ordre.find((c) => r[c] - delta >= 0 && r[c] - delta <= 100)
  if (!compense) return null
  return { ...r, [cle]: cible, [compense]: r[compense] - delta }
}

/* ----------------------------------------------------------------------------------------------
 * Évaluations et feuilles d'exercices (panneau professeur) et assistant élève : partage ÉGAL entre
 * les compétences cochées (décision de l'utilisateur, 22/11/2026 : « hyper flexible », une, deux ou
 * trois compétences, sans répartition à respecter). Jamais mémorisé.
 * -------------------------------------------------------------------------------------------- */

const PROCESSUS_ORDRE = [1, 2, 3] as const

/** Fractions (somme 1) : 1/n pour chacune des n compétences cochées, 0 pour les autres. Aucune
 * cochée → tout à 0 (rien ne sera composé). */
export function partageEgal(cochees: readonly Processus[]): Record<Processus, number> {
  const liste = PROCESSUS_ORDRE.filter((p) => cochees.includes(p))
  const r: Record<Processus, number> = { 1: 0, 2: 0, 3: 0 }
  for (const p of liste) r[p] = 1 / liste.length
  return r
}

export const CLE_DE_PROCESSUS: Readonly<Record<Processus, CleRepartition>> = { 1: 'connaitre', 2: 'appliquer', 3: 'transferer' }

/** Parts égales en pourcentages entiers (somme 100) — point de départ des boutons − / + : trois
 * cochées → 33 / 34 / 33 (le point restant à Appliquer s'il est coché, sinon à la première cochée). */
export function pourcentsEgaux(cochees: readonly Processus[]): RepartitionPourcents {
  const liste = PROCESSUS_ORDRE.filter((p) => cochees.includes(p))
  const r: RepartitionPourcents = { connaitre: 0, appliquer: 0, transferer: 0 }
  if (liste.length === 0) return r
  const base = Math.floor(100 / liste.length)
  for (const p of liste) r[CLE_DE_PROCESSUS[p]] = base
  const reste = 100 - base * liste.length
  if (reste > 0) r[CLE_DE_PROCESSUS[liste.includes(2) ? 2 : liste[0]]] += reste
  return r
}

/** Plus petite part d'une compétence cochée (une cochée compte toujours ; pour l'enlever : la décocher). */
export const PART_MIN_COCHEE = PAS_REPARTITION

/**
 * Bouton − / + du réglage d'une évaluation / feuille : comme `ajusterRepartition` (même ordre de
 * compensation), mais seules les AUTRES compétences COCHÉES compensent, et une cochée garde au moins
 * `PART_MIN_COCHEE` — une compétence non cochée reste à 0 %. `null` si impossible (une seule cochée,
 * borne atteinte) : le bouton est désactivé.
 */
export function ajusterParts(r: RepartitionPourcents, cle: CleRepartition, delta: number, cochees: readonly Processus[]): RepartitionPourcents | null {
  const cles = CLES_REPARTITION.filter((c) => cochees.includes(PROCESSUS_DE_CLE[c]))
  if (!cles.includes(cle)) return null
  const cible = r[cle] + delta
  if (delta === 0 || cible < PART_MIN_COCHEE || cible > 100) return null
  const autres = cles.filter((c) => c !== cle)
  let ordre: CleRepartition[]
  if (cle === 'appliquer' && autres.length === 2) {
    const [a, b] = autres // connaitre, transferer
    if (delta > 0) ordre = r[b] >= r[a] ? [b, a] : [a, b]
    else ordre = r[a] <= r[b] ? [a, b] : [b, a]
  } else {
    ordre = [...autres].sort((x, y) => (x === 'appliquer' ? -1 : y === 'appliquer' ? 1 : 0))
  }
  const compense = ordre.find((c) => r[c] - delta >= PART_MIN_COCHEE && r[c] - delta <= 100)
  if (!compense) return null
  return { ...r, [cle]: cible, [compense]: r[compense] - delta }
}

/** « Connaître, Appliquer et Transférer » (ordre des processus). */
export function texteCompetences(cochees: readonly Processus[]): string {
  const noms = PROCESSUS_ORDRE.filter((p) => cochees.includes(p)).map((p) => LIBELLE_CLE[CLE_DE_PROCESSUS[p]])
  return noms.length <= 1 ? (noms[0] ?? '') : `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`
}

/* ----------------------------------------------------------------------------------------------
 * Évaluation blanche de l'ÉLÈVE : parts tirées AU HASARD (décision de l'utilisateur, 22/11/2026,
 * choix c) — « je ne respecte pas les proportions […] je ne peux faire croire aux élèves que mon
 * évaluation sera équilibrée comme dans leur simulation »). Par défaut, chaque préparation tire des
 * parts déséquilibrées entre les compétences COCHÉES ; l'élève peut aussi les régler lui-même
 * (`ajusterParts`, comme le professeur, non mémorisé). Jamais une compétence non cochée. La feuille
 * d'exercices de l'élève (parts égales) et les documents du professeur ne sont pas concernés.
 *
 * Loi : parts multiples de 5 %, chacune entre 15 % et 70 %, somme 100 %, tirées UNIFORMÉMENT parmi
 * toutes les répartitions possibles (deux cochées : 9 répartitions, de 30 / 70 à 70 / 30 ; trois :
 * 78) ; une seule cochée → 100 %. 15 % au moins : une compétence annoncée garde une vraie place ;
 * 70 % au plus : jamais « tout sauf une » ; le tirage uniforme ne favorise aucune compétence (33 % en
 * moyenne) mais donne souvent une répartition nettement déséquilibrée (trois cochées : une part d'au
 * moins 50 % dans 45 répartitions sur 78, soit 58 % des tirages). Reproductible : mêmes cochées,
 * même graine → mêmes parts.
 * -------------------------------------------------------------------------------------------- */

export const PART_MIN_HASARD = 15
export const PART_MAX_HASARD = 70
export const PAS_HASARD = 5

/** Toutes les répartitions de la loi pour ces cochées, dans un ordre fixe. Aucune cochée → aucune. */
export function repartitionsHasardPossibles(cochees: readonly Processus[]): RepartitionPourcents[] {
  const cles = CLES_REPARTITION.filter((c) => cochees.includes(PROCESSUS_DE_CLE[c]))
  const vide: RepartitionPourcents = { connaitre: 0, appliquer: 0, transferer: 0 }
  if (cles.length === 0) return []
  if (cles.length === 1) return [{ ...vide, [cles[0]]: 100 }]
  const res: RepartitionPourcents[] = []
  const suite = (i: number, reste: number, acc: number[]) => {
    if (i === cles.length - 1) {
      if (reste >= PART_MIN_HASARD && reste <= PART_MAX_HASARD) {
        const r = { ...vide }
        cles.forEach((c, k) => (r[c] = k < acc.length ? acc[k] : reste))
        res.push(r)
      }
      return
    }
    for (let v = PART_MIN_HASARD; v <= PART_MAX_HASARD && v < reste; v += PAS_HASARD) suite(i + 1, reste - v, [...acc, v])
  }
  suite(0, 100, [])
  return res
}

/** Générateur pseudo-aléatoire déterministe (mulberry32, même formule que les codes d'exercice). */
export function aleatoireDepuisGraine(graine: number): () => number {
  let a = graine >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Parts au hasard (pourcentages entiers, somme 100) pour ces cochées : fonction de la seule graine. */
export function tirerPartsHasard(cochees: readonly Processus[], graine: number): RepartitionPourcents {
  const possibles = repartitionsHasardPossibles(cochees)
  if (possibles.length === 0) return { connaitre: 0, appliquer: 0, transferer: 0 }
  return possibles[Math.min(possibles.length - 1, Math.floor(aleatoireDepuisGraine(graine)() * possibles.length))]
}

/** Parts (fractions, somme 1) ramenées aux seules compétences `presentes`, au prorata : une cochée
 * sans exercice cède sa part aux autres présentes, jamais à une absente. Aucune présente → tout à 0. */
export function partsAuProrata(parts: Readonly<Record<Processus, number>>, presentes: readonly Processus[]): Record<Processus, number> {
  const res: Record<Processus, number> = { 1: 0, 2: 0, 3: 0 }
  const receveuses = PROCESSUS_ORDRE.filter((p) => parts[p] > 0 && presentes.includes(p))
  const somme = receveuses.reduce((t, p) => t + parts[p], 0)
  for (const p of receveuses) res[p] = parts[p] / somme
  return res
}

/** Fractions → pourcentages entiers de somme 100 (plus forts restes ; à égalité, Appliquer d'abord,
 * puis l'ordre des processus) — mêmes valeurs que `pourcentsEgaux` pour des parts égales. */
export function pourcentsEntiers(fractions: Readonly<Record<Processus, number>>): RepartitionPourcents {
  const r: RepartitionPourcents = { connaitre: 0, appliquer: 0, transferer: 0 }
  const liste = PROCESSUS_ORDRE.filter((p) => fractions[p] > 0)
  const somme = liste.reduce((t, p) => t + fractions[p], 0)
  if (somme <= 0) return r
  const bruts = liste.map((p) => {
    const v = (100 * fractions[p]) / somme
    return { p, base: Math.floor(v + 1e-9), reste: v - Math.floor(v + 1e-9) }
  })
  for (const b of bruts) r[CLE_DE_PROCESSUS[b.p]] = b.base
  let manque = 100 - bruts.reduce((t, b) => t + b.base, 0)
  const ordre = [...bruts].sort((a, b) => b.reste - a.reste || (a.p === 2 ? -1 : b.p === 2 ? 1 : a.p - b.p))
  for (let i = 0; manque > 0; i++, manque--) r[CLE_DE_PROCESSUS[ordre[i % ordre.length].p]]++
  return r
}

/** « Connaître 20 % · Appliquer 65 % · Transférer 15 % » (compétences à part > 0, espace insécable
 * avant « % »). */
export function texteParts(r: RepartitionPourcents): string {
  return CLES_REPARTITION.filter((c) => r[c] > 0)
    .map((c) => `${LIBELLE_CLE[c]} ${r[c]} %`)
    .join(' · ')
}
