import type { Processus } from './evaluationPayload'

/**
 * Répartition d'une « vraie évaluation » entre les processus Connaître / Appliquer / Transférer —
 * répartition de l'utilisateur, 25 / 50 / 25 (décision du 22/11/2026). SEULE source de ces
 * proportions par défaut : assistant élève (`compositionEleve.ts`, recalculées sur les compétences
 * cochées — toujours la constante, jamais réglable), « Préparer l'évaluation » de la page de
 * conception (`components/admin/conception/composer.ts`) et le texte de sa carte (`texteRepartition`).
 * Ne jamais recopier ces nombres ailleurs (ni dans l'interface élève, qui dit « réparti comme une
 * vraie évaluation », ni dans la documentation).
 *
 * Réglable par le professeur (décision de l'utilisateur, 22/11/2026) : « Préparer l'évaluation »
 * de la page de conception seulement, valeur mémorisée dans `profils.repartition`
 * (`supabase/migrations/0005_repartition.sql`, NULL = ce défaut) — voir `RepartitionPourcents`.
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
