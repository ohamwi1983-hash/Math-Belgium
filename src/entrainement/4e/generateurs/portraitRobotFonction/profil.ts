import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExercicePortraitRobot } from "../../core/portraitRobotFonction.types";

/**
 * Profil d'instance de gen71 (« Le portrait-robot d'une fonction ») pour le tirage équilibré des
 * évaluations (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ») :
 * - `forme` = la famille de l'exercice (retrouver l'expression / raisonner sans expression / choisir
 *   la courbe), imposée identique d'une série à l'autre, question par question ;
 * - cas particulier = famille A avec une translation nulle (TH = 0 ou TV = 0) : une étape de moins à
 *   trouver. Les familles B et C n'en ont pas : leurs issues sont des VERDICTS (comparaison possible
 *   ou « on ne peut pas savoir », courbe choisie) — un verdict n'est jamais un cas particulier.
 * - `calcul` absent : toutes les réponses sont des valeurs exactes (entiers), sans calculatrice.
 */
export const LIBELLE_CAS_PORTRAIT_ROBOT = "Inclure un cas particulier (retrouver l'expression : une translation nulle)";

export function profilPortraitRobot(e: ExercicePortraitRobot): ProfilInstance {
  if (e.famille !== "expression") return { casParticulier: null, forme: e.famille };
  return { casParticulier: e.cible.h === 0 || e.cible.k === 0 ? "translation-nulle" : null, forme: e.famille };
}
