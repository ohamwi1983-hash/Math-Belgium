import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveLogarithmes } from "../../core6e/detectiveLogarithmes.types";
import { SCENARIOS } from "../../moteur6e/modeleDetectiveLogarithmes";

/**
 * Profil d'instance de 6gen88 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré ») — même principe que 6gen84 : même type d'erreur,
 * dans le même exercice support, à la même ligne, dans toutes les séries.
 *
 * - La VARIANTE fixe le type d'erreur.
 * - `forme` = type d'erreur + scénario + ligne fausse (ex. « domaine|D2|L4 ») : le scénario
 *   distingue les deux exercices supports d'une même variante (ex. D1 : CE calculée sur la forme
 *   regroupée, D2 : CE jamais vérifiée), même quand leur ligne fausse a le même numéro ; seuls les
 *   nombres changent d'une série à l'autre. Dans une variante, chaque forme sort avec une
 *   probabilité de 50 % (scénarios équiprobables, `index.ts`) : 20 000 essais suffisent largement.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, nommer, corriger).
 * - Pas de `calcul` : toutes les instances sont exactes (rationnels, puissances de e, quotients
 *   de ln), sans calculatrice.
 */
export function formeDetectiveLogarithmes(e: ExerciceDetectiveLogarithmes): string {
  const s = SCENARIOS[e.scenario];
  return [s.type, e.scenario, `L${s.ligne + 1}`].join("|");
}

export function profilDetectiveLogarithmes(e: ExerciceDetectiveLogarithmes): ProfilInstance {
  return { casParticulier: null, forme: formeDetectiveLogarithmes(e) };
}
