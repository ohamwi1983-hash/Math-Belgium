import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceProjeteSymetrique } from "../../core/projeteSymetrique.types";

/**
 * Profil d'instance de gen96 (tirage équilibré, `.claude/rules/feuilles-evaluations.md`).
 * - `forme` = la variante (symétrique / réflexion) : même démarche dans toutes les séries d'une
 *   question ; le contexte de la réflexion (billard, miroir, mur) reste tiré au hasard (habillage,
 *   même calcul).
 * - Aucun cas particulier (d n'est jamais horizontale ni verticale, I n'est jamais le projeté de A),
 *   aucun verdict, pas de `calcul` : tout est exact (entiers, racines carrées).
 */
export function profilProjeteSymetrique(e: ExerciceProjeteSymetrique): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
