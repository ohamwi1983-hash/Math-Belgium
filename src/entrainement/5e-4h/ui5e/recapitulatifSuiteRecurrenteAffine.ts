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
 * Icône (✓/✗) pilotée par `etat.poserRecurrenceRevele`/`etat.regimePermanentRevele`, peuplés
 * depuis `etapeCourante.revelee` à la clôture de chaque écran (`sessionSuiteRecurrenteAffine.ts`) —
 * jamais `scoreXxxPartiel === 0` (point A, balayage générique) : la pénalité d'aide multi-niveaux
 * de ce générateur est soustraite APRÈS le score de tentatives puis plafonnée à 0, donc une
 * réussite fortement aidée pouvait légitimement tomber à 0 et s'afficher à tort comme "révélée".
 */
export function calculerRecapitulatifSuiteRecurrenteAffine(etat: EtatSessionSuiteRecurrenteAffine): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const [relation, regime] = formatTermesEtatActuelLatex(exercice, "termesSuccessifs") ?? [];
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scorePoserRecurrencePartiel !== null) {
    entrees.push({ libelle: "Relation de récurrence", estLatex: true, valeur: relation, revele: etat.poserRecurrenceRevele });
  }
  if (etat.scoreRegimePermanentPartiel !== null) {
    entrees.push({ libelle: "Régime permanent", estLatex: true, valeur: regime, revele: etat.regimePermanentRevele });
  }
  return entrees;
}
