import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveErreurs } from "../../core/detectiveErreurs.types";
import { SCENARIOS } from "../../moteur/modeleDetectiveErreurs";

/**
 * Profil d'instance de gen81 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré ») — validé par l'utilisateur : même type d'erreur,
 * à la même étape, dans toutes les séries.
 *
 * - La VARIANTE fixe le type d'erreur.
 * - `forme` = type d'erreur + configuration du triangle + ligne fausse (ex. « obtus|SAS|L4 ») : la
 *   même erreur, sur le même genre de données, à la même étape de la copie ; seuls les nombres
 *   changent d'une série à l'autre. Dans une variante, chaque forme sort avec une probabilité
 *   d'au moins 25 % (2 à 4 scénarios équiprobables, `index.ts`) : 20 000 essais suffisent largement.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, nommer, corriger) ; la
 *   présence d'un second triangle (cas ambigu) est le VERDICT de la question, jamais un cas
 *   particulier.
 * - `calcul: 'calculatrice'` : toutes les valeurs sont décimales (`calculatriceIndispensable`).
 */
export function formeDetectiveErreurs(e: ExerciceDetectiveErreurs): string {
  const s = SCENARIOS[e.scenario];
  return `${s.type}|${s.configuration}|L${s.ligne + 1}`;
}

export function profilDetectiveErreurs(e: ExerciceDetectiveErreurs): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: formeDetectiveErreurs(e) };
}
