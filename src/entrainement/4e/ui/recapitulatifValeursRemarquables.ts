import type { EtatSessionValeursRemarquables } from "../moteur/typesValeursRemarquables";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libelleQuadrant } from "./formatCercleTrigonometrique";

/** Même principe que les autres récapitulatifs du projet : dérivé uniquement des scores déjà
 * trackés, toujours la vraie valeur confirmée. Aucune entrée pour "valeursExactes" : dernière
 * étape, clôture toujours immédiatement l'exercice. */
export function calculerRecapitulatifValeursRemarquables(etat: EtatSessionValeursRemarquables): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreQuadrantExercice !== null) {
    entrees.push({ libelle: "Quadrant", estLatex: false, valeur: libelleQuadrant(exercice.quadrant) });
  }

  if (etat.scoreAnglePremierQuadrantExercice !== null) {
    entrees.push({ libelle: "Angle du premier quadrant", estLatex: false, valeur: `${exercice.anglePremierQuadrant}°` });
  }

  return entrees;
}
