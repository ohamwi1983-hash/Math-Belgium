import type { EtatSessionInequation } from "../moteur/sessionInequation";
import { formatMembreGauche } from "./formatEquation";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif accumulé pour l'exercice "tableau de signes", même principe que
 * calculerRecapitulatif (src/ui/recapitulatif.ts) pour "méthode la plus rapide" — mais fichier
 * séparé car celui-ci est typé pour EtatSession (2nd degré), un contrat différent. Affiche
 * toujours la vraie valeur confirmée (exercice.racines / signe réel de a), jamais la saisie brute
 * de l'élève — contrairement au croquis de l'étape signe_a, qui lui est volontairement basé sur
 * la saisie de l'élève (illustratif). Voir CLAUDE.md pour l'invariant "toujours la vraie valeur".
 */
export function calculerRecapitulatifInequation(etat: EtatSessionInequation): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreSimplificationExercice !== null) {
    entrees.push({ libelle: "Trinôme simplifié", estLatex: true, valeur: formatMembreGauche(exercice.enonce) });
  }

  if (etat.scoreRacinesExercice !== null) {
    const valeur = exercice.racines === undefined ? "∅" : exercice.racines.join(" ; ");
    entrees.push({ libelle: "Racines", estLatex: false, valeur });
  }

  if (etat.scoreSigneAExercice !== null) {
    entrees.push({ libelle: "Signe de a", estLatex: false, valeur: exercice.enonce.a > 0 ? "a > 0" : "a < 0" });
  }

  return entrees;
}
