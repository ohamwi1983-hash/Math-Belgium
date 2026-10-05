import type { EtatSessionCercleTrigonometrique } from "../moteur/typesCercleTrigonometrique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libelleQuadrant } from "./formatCercleTrigonometrique";

/**
 * Même principe que les 13 autres récapitulatifs du projet : dérivé uniquement des scores déjà
 * trackés par le moteur (scoreXxxExercice !== null ⟺ l'étape a eu lieu et est close), toujours la
 * vraie valeur confirmée (exerciceCourant), jamais la saisie de l'élève. Aucune entrée pour
 * "signes" : dernière étape, clôture toujours immédiatement l'exercice.
 */
export function calculerRecapitulatifCercleTrigonometrique(etat: EtatSessionCercleTrigonometrique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreReductionExercice !== null) {
    entrees.push({ libelle: "Angle réduit", estLatex: false, valeur: `${exercice.angleReduit}°` });
  }

  if (etat.scoreQuadrantExercice !== null) {
    entrees.push({ libelle: "Quadrant", estLatex: false, valeur: libelleQuadrant(exercice.quadrant) });
  }

  if (etat.scoreAnglePremierQuadrantExercice !== null) {
    entrees.push({ libelle: "Angle du premier quadrant", estLatex: false, valeur: `${exercice.anglePremierQuadrant}°` });
  }

  return entrees;
}
