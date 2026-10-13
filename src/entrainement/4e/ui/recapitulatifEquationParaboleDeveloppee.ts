import type { EtatSessionEquationParaboleDeveloppee } from "../moteur/typesEquationParaboleDeveloppee";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatCompletionLatex, formatRegroupementLatex } from "./formatEquationParaboleDeveloppee";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 3 phases FIXES ("regroupement" → "completion" →
 * "caracteristiques", voir `moteur/typesEquationParaboleDeveloppee.ts`), toujours traversées dans
 * cet ordre par les deux variantes. Réutilise TELLES QUELLES les fonctions de formatage déjà
 * écrites pour les anciens blocs "état actuel" (`EtapeCompletionEquationParaboleDeveloppee`,
 * `EtapeCaracteristiquesEquationParaboleDeveloppee`).
 */
export function calculerRecapitulatifEquationParaboleDeveloppee(etat: EtatSessionEquationParaboleDeveloppee): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreRegroupementExercice !== null) {
    entrees.push({ libelle: "Regroupement", estLatex: true, valeur: formatRegroupementLatex(exercice), revele: etat.regroupementRevele });
  }

  if (etat.scoreCompletionExercice !== null) {
    entrees.push({ libelle: "Complétion du carré", estLatex: true, valeur: formatCompletionLatex(exercice), revele: etat.completionRevele });
  }

  return entrees;
}
