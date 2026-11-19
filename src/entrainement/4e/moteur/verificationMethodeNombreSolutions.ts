import type { ExerciceMethodeNombreSolutions, IdAffirmation, MethodeRapide } from "../core/methodeNombreSolutions.types";
import { lireValeurs, memesValeurs } from "../ui/ensembleSolutionTrinome";
import { affirmationVraie, methodesAcceptees, solutions } from "./modeleMethodeNombreSolutions";

/**
 * Vérification de gen113. Écran 1 : méthode (racine évidente OU discriminant acceptés quand
 * a ± b + c = 0, décision 1). Écran 2 : l'affirmation choisie doit être vraie (une seule l'est parmi
 * les quatre). Écran 3 : les solutions, champ libre jamais filtré (valeurs séparées par « ; »,
 * fractions et racines acceptées, « x = » toléré), comparées comme un ENSEMBLE.
 */

export type StatutSolutions = "correct" | "faux" | "parse_error";

export function verifierMethode(e: ExerciceMethodeNombreSolutions, m: MethodeRapide): boolean {
  return methodesAcceptees(e).includes(m);
}

export function verifierAffirmation(e: ExerciceMethodeNombreSolutions, id: IdAffirmation): boolean {
  return affirmationVraie(id, e);
}

export function diagnostiquerSolutions(e: ExerciceMethodeNombreSolutions, texte: string): StatutSolutions {
  if (texte.trim() === "") return "parse_error";
  const v = lireValeurs(texte);
  if (v === null) return "parse_error";
  return memesValeurs(v, solutions(e)) ? "correct" : "faux";
}
