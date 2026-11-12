/**
 * Profil d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 6gen75 « Fréquence et probabilité » — chapitre 6 de 6e « Les probabilités ». Décisions de
 * l'utilisateur (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ») :
 * - `forme` = famille (A dé, B somme de deux dés, C objet sans modèle) : la série A fixe, question par
 *   question, le TYPE d'expérience ; les autres séries le reproduisent avec d'autres données ;
 * - AUCUN cas particulier : chaque instance est un exercice complet (quatre étapes), et l'issue de
 *   l'étape 3 (compatible ou non, dé truqué ou non) est un VERDICT — jamais filtré, ni fixé par la
 *   série A ;
 * - `calcul` = calculatrice partout : fréquence (effectif sur 60 à 3 600 essais) et écart relatif
 *   ne sont jamais des valeurs remarquables (`calculatriceIndispensable` dans l'adaptateur).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceFrequenceProbabilite } from "../core6e/frequenceProbabilite.types";

export function profilFrequenceProbabilite(e: ExerciceFrequenceProbabilite): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.famille };
}
