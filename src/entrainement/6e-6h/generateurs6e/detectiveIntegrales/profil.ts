import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveIntegrales } from "../../core6e/detectiveIntegrales.types";
import { SCENARIOS } from "../../moteur6e/modeleDetectiveIntegrales";

/**
 * Profil d'instance de 6gen84 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré ») — même principe que gen81/gen91 : même type
 * d'erreur, dans le même exercice support, à la même étape, dans toutes les séries.
 *
 * - La VARIANTE fixe le type d'erreur.
 * - `forme` = type d'erreur + exercice support + ligne fausse + scénario (ex.
 *   « aire|aireDeuxCourbes|L2|R2 » ; le scénario distingue « carré oublié » et « π oublié », même
 *   support et même ligne) :
 *   seuls les nombres changent d'une série à l'autre. Dans une variante, chaque forme sort avec une
 *   probabilité d'au moins 50 % (scénarios équiprobables, `index.ts`) : 20 000 essais suffisent
 *   largement.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, nommer, corriger).
 * - Pas de `calcul` : toutes les instances sont exactes (rationnels, π, ln, √3), sans calculatrice.
 */
export function formeDetectiveIntegrales(e: ExerciceDetectiveIntegrales): string {
  const s = SCENARIOS[e.scenario];
  return [s.type, s.support, `L${s.ligne + 1}`, e.scenario].join("|");
}

export function profilDetectiveIntegrales(e: ExerciceDetectiveIntegrales): ProfilInstance {
  return { casParticulier: null, forme: formeDetectiveIntegrales(e) };
}
