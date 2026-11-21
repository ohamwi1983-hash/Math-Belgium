import type { Processus } from './evaluationPayload'

/**
 * Répartition d'une « vraie évaluation » entre les processus Connaître / Appliquer / Transférer —
 * répartition de l'utilisateur, 25 / 50 / 25 (décision du 22/11/2026). SEULE source de ces
 * proportions : assistant élève (`compositionEleve.ts`, recalculées sur les compétences cochées),
 * « Préparer l'évaluation » de la page de conception (`components/admin/conception/composer.ts`) et
 * le texte de sa carte (`texteRepartition`). Ne jamais recopier ces nombres ailleurs (ni dans
 * l'interface élève, qui dit « réparti comme une vraie évaluation », ni dans la documentation).
 * Pas encore réglable (chantier séparé).
 */
export const REPARTITION_PROCESSUS: Readonly<Record<Processus, number>> = { 1: 0.25, 2: 0.5, 3: 0.25 }

/** Pourcentages de la répartition, dans l'ordre Connaître / Appliquer / Transférer. */
export function pourcentsRepartition(): number[] {
  return ([1, 2, 3] as const).map((p) => Math.round(REPARTITION_PROCESSUS[p] * 100))
}

/** « 25 % / 50 % / 25 % » (`compact` : « 25 / 50 / 25 % »). */
export function texteRepartition(compact = false): string {
  const pc = pourcentsRepartition()
  return compact ? `${pc.join(' / ')} %` : pc.map((n) => `${n} %`).join(' / ')
}
