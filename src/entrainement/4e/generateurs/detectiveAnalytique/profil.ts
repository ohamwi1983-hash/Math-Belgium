import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveAnalytique } from "../../core/detectiveAnalytique.types";

/**
 * Profil d'instance de gen99 (tirage équilibré) — même principe que gen127 / gen121 / gen112.
 * - La VARIANTE fixe l'exercice support (droite, perpendiculaire, pente, cercle, parabole, distance).
 * - La LIGNE FAUSSE (0 à 3 lignes justes avant elle, 25 % chacune) et le TYPE D'ERREUR (pile ou face
 *   dans le support) sont les verdicts des écrans a) et b) : tirés au hasard dans chaque série, JAMAIS
 *   dans `forme`. Aucun nom de variante ne donne le type d'erreur : pas de groupe à verdict nécessaire.
 * - `forme` = le support ; aucun cas particulier ; pas de `calcul` (tout est exact).
 */
export function profilDetectiveAnalytique(e: ExerciceDetectiveAnalytique): ProfilInstance {
  return { casParticulier: null, forme: e.support };
}
