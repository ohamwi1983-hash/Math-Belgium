import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDroitesParametre } from "../../core/droitesParametre.types";

/**
 * Profil d'instance de gen95 (tirage équilibré des évaluations).
 * - `forme` = type de question (la variante) + degré de l'équation en m (1 ou 2, tiré à parts égales
 *   sauf pour « point », toujours 2) : signature de difficulté reproduite d'une série à l'autre.
 * - Le NOMBRE de valeurs de m (0, 1 ou 2) est le VERDICT : tiré à parts égales avant les nombres, jamais
 *   dans `forme`, jamais un cas particulier. Aucun nom de variante ne le donne : pas de groupe à verdict.
 * - Pas de cas particulier ni de `calcul` (racines entières ou fractions simples).
 */
export function profilDroitesParametre(e: ExerciceDroitesParametre): ProfilInstance {
  return { casParticulier: null, forme: `${e.variante}|degre${e.degre}` };
}
