/**
 * Partage entre collègues (`lib/partages.ts`) — partie LOURDE, chargée par `import()` seulement sur la
 * page d'un lien de partage : elle embarque le pipeline du panneau (adaptateurs, tirage, documents).
 *
 * - `nouveauTirage` : « nouveaux exercices » à l'import = MÊME structure (lignes, variantes, points,
 *   options, nombre de séries), nouvelles graines, par le pipeline du panneau (`construireItemsPayload`
 *   → `construirePlan`) — jamais un second moteur. Une feuille de remédiation (lignes de l'évaluation
 *   d'origine) ne se re-tire pas : `peutRetirer` est faux.
 * - `dureeEstimeePlan` : « durée estimée » de la série A, même calcul que la copie
 *   (`dureeEstimeeMinutes` : somme des durées par exercice, arrondie aux 5 min).
 */
import { LEVELS } from '../content/chaptersIndex'
import { dureeEstimeeMinutes } from '../entrainement/export/assemblerEvaluationHtml'
import { construireItemsPayload, type ChapitreAvecSections } from './evaluationPayload'
import { construirePlan, itemsDepuisSerie, peutGenererLocalement, type PlanDocument } from './evaluationLocal'

function chapitresDuPlan(plan: PlanDocument): ChapitreAvecSections[] {
  const niveau = LEVELS.find((l) => l.slug === plan.levelSlug)
  return (niveau?.chapters ?? [])
    .filter((c) => plan.chapitresSlugs.includes(c.slug))
    .map((c) => ({ chapitreSlug: c.slug, chapterNumber: c.chapterNumber, title: c.title, sections: c.sections, formulaire: c.formulaire }))
}

export function peutRetirer(plan: PlanDocument): boolean {
  if (plan.remediation || !Array.isArray(plan.lignes) || plan.lignes.length === 0) return false
  const entete = { ...plan.entete, nombreSeries: Math.max(1, plan.series?.length ?? 1) }
  const items = construireItemsPayload(entete, plan.lignes, chapitresDuPlan(plan))
  return peutGenererLocalement(plan.levelSlug, items)
}

/** Même structure, nouvelles graines. Lève une erreur (message en français) si le document ne peut
 * pas être re-tiré ici. */
export async function nouveauTirage(plan: PlanDocument): Promise<PlanDocument> {
  if (plan.remediation) throw new Error('Une feuille de remédiation ne peut pas être re-tirée : choisis « Mêmes exercices ».')
  const entete = { ...plan.entete, nombreSeries: Math.max(1, plan.series?.length ?? 1) }
  delete entete.cartouche
  const items = construireItemsPayload(entete, plan.lignes ?? [], chapitresDuPlan(plan))
  if (!peutGenererLocalement(plan.levelSlug, items)) throw new Error('Nouveau tirage impossible pour ce document : choisis « Mêmes exercices ».')
  return construirePlan(plan.levelSlug, entete, items, plan.lignes, plan.chapitresSlugs)
}

export async function dureeEstimeePlan(plan: PlanDocument): Promise<number | null> {
  const serie = plan.series?.[0]
  if (!serie) return null
  return dureeEstimeeMinutes(await itemsDepuisSerie(serie))
}
