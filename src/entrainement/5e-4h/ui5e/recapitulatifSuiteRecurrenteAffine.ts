import { formatTermesEtatActuelLatex } from "./formatSuiteRecurrenteAffine";
import type { EtatSessionSuiteRecurrenteAffine } from "../moteur5e/typesSuiteRecurrenteAffine";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen19 — reprend EXACTEMENT les mêmes valeurs que
 * l'ancien bloc "état actuel" (`components5e/EtatActuelSuiteRecurrenteAffine.tsx`, qui appelle
 * `formatTermesEtatActuelLatex`). Séquence FIXE à 3 écrans
 * (`poserRecurrence → regimePermanent → termesSuccessifs`, jamais de saut — voir
 * `moteur5e/typesSuiteRecurrenteAffine.ts`), donc pas besoin d'un `ordreComplet` dynamique comme
 * 5gen14/5gen15/5gen17 : on appelle directement `formatTermesEtatActuelLatex(exercice,
 * "termesSuccessifs")`, qui renvoie TOUJOURS les 2 valeurs (relation de récurrence confirmée, puis
 * régime permanent confirmé) — purement dérivées de `exercice`, jamais de la progression réelle —
 * et on les affiche une par une selon ce qui est RÉELLEMENT clos (`scoreXxxPartiel !== null`),
 * même convention que `AppAnalyseFonction.tsx` (4e).
 *
 * Heuristique de révélation : le moteur ne garde que `derniereEtapeRevelee` (générique), jamais un
 * booléen par phase — `scoreXxxPartiel === 0` pilote donc l'icône (✓/✗), même convention que les 4
 * autres cibles de cette tâche.
 */
export function calculerRecapitulatifSuiteRecurrenteAffine(etat: EtatSessionSuiteRecurrenteAffine): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const [relation, regime] = formatTermesEtatActuelLatex(exercice, "termesSuccessifs") ?? [];
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scorePoserRecurrencePartiel !== null) {
    entrees.push({ libelle: "Relation de récurrence", estLatex: true, valeur: relation, revele: etat.scorePoserRecurrencePartiel === 0 });
  }
  if (etat.scoreRegimePermanentPartiel !== null) {
    entrees.push({ libelle: "Régime permanent", estLatex: true, valeur: regime, revele: etat.scoreRegimePermanentPartiel === 0 });
  }
  return entrees;
}
