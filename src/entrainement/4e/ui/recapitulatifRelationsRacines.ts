import type { EtatSessionRelationsRacines } from "../moteur/sessionRelationsRacines";
import { sommeEtProduitAttendus } from "../moteur/verificationRelationsRacines";
import { formatFormeFactoriseeDepuisRacines } from "./formatEquation";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif accumulé pour "Relations entre racines et coefficients" — même principe que
 * `calculerRecapitulatifInequation` (ui/recapitulatifInequation.ts) : toujours la vraie valeur
 * confirmée (déduite de `exercice.racines`), jamais la saisie de l'élève. Pas d'entrée pour
 * "equationDepuisRacines" : phase terminale, clôture toujours immédiatement l'exercice.
 */
export function calculerRecapitulatifRelationsRacines(etat: EtatSessionRelationsRacines): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreSommeProduitExercice !== null) {
    const { s, p } = sommeEtProduitAttendus(exercice);
    entrees.push({
      libelle: "Somme et produit",
      estLatex: true,
      valeur: `S = ${s} \\quad P = ${p}`,
      revele: etat.sommeProduitRevele,
    });
  }

  if (etat.scoreFactorisationExercice !== null) {
    entrees.push({
      libelle: "Factorisation générale",
      estLatex: true,
      valeur: `${formatFormeFactoriseeDepuisRacines(exercice.enonce, exercice.racines)} = 0`,
      revele: etat.factorisationRevele,
    });
  }

  return entrees;
}
