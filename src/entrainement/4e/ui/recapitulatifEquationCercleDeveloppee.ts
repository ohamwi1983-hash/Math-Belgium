import type { EtatSessionEquationCercleDeveloppee } from "../moteur/typesEquationCercleDeveloppee";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelCompletionLatex, formatEtatActuelRegroupementLatex } from "./formatEquationCercleDeveloppee";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 3 phases FIXES ("regroupement" → "completion" →
 * "centreRayon", voir `moteur/typesEquationCercleDeveloppee.ts`), toujours traversées dans cet
 * ordre par les deux variantes. Réutilise TELLES QUELLES les fonctions de formatage déjà écrites
 * pour les anciens blocs "état actuel" (`EtapeCompletionEquationCercleDeveloppee`,
 * `EtapeCentreRayonEquationCercleDeveloppee`).
 */
export function calculerRecapitulatifEquationCercleDeveloppee(etat: EtatSessionEquationCercleDeveloppee): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreRegroupementExercice !== null) {
    entrees.push({ libelle: "Regroupement", estLatex: true, valeur: formatEtatActuelRegroupementLatex(exercice), revele: etat.regroupementRevele });
  }

  if (etat.scoreCompletionExercice !== null) {
    entrees.push({ libelle: "Complétion du carré", estLatex: true, valeur: formatEtatActuelCompletionLatex(exercice), revele: etat.completionRevele });
  }

  return entrees;
}
