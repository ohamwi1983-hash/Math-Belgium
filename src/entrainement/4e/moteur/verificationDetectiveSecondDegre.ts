import type { ExerciceDetectiveSecondDegre, IdDescriptionSecondDegre } from "../core/detectiveSecondDegre.types";
import type { LectureSaisieEnsemble } from "../components/SaisieEnsembleSolutionTrinome";
import { egauxEnsembles, type EnsembleReel } from "../ui/ensembleSolutionTrinome";
import { descriptionCorrecte, indiceLigneFausse, solutionCopie, solutionCorrecte } from "./modeleDetectiveSecondDegre";

/**
 * Vérification de gen121. Écran 1 : le numéro de la ligne fausse. Écran 2 : la description de
 * l'erreur. Écran 3 : l'ensemble-solution corrigé, construit avec la saisie guidée du chapitre
 * (`SaisieEnsembleSolutionTrinome`) et comparé comme un ENSEMBLE de réels (même allure, mêmes
 * bornes, mêmes crochets ; l'ordre des valeurs ou des morceaux est indifférent). Une saisie
 * illisible (`parse_error`) ne consomme pas de tentative.
 */

export type StatutCorrectionSecondDegre = "correct" | "faux" | "parse_error";

export function verifierLigne(e: ExerciceDetectiveSecondDegre, indice: number): boolean {
  return indice === indiceLigneFausse(e);
}

export function verifierDescription(e: ExerciceDetectiveSecondDegre, choix: IdDescriptionSecondDegre): boolean {
  return choix === descriptionCorrecte(e);
}

export function verifierEnsemble(e: ExerciceDetectiveSecondDegre, ensemble: EnsembleReel): boolean {
  return egauxEnsembles(ensemble, solutionCorrecte(e), 1e-9);
}

export function diagnostiquerCorrection(e: ExerciceDetectiveSecondDegre, lecture: LectureSaisieEnsemble): StatutCorrectionSecondDegre {
  if (lecture.statut !== "ok") return "parse_error";
  return verifierEnsemble(e, lecture.ensemble) ? "correct" : "faux";
}

/** La saisie reprend l'ensemble (faux) de la copie : l'erreur n'a pas été corrigée. */
export function estResultatCopie(e: ExerciceDetectiveSecondDegre, ensemble: EnsembleReel): boolean {
  return egauxEnsembles(ensemble, solutionCopie(e), 1e-6);
}
