import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveVecteurs } from "../../core/detectiveVecteurs.types";
import { SCENARIOS } from "../../moteur/modeleDetectiveVecteurs";

/**
 * Profil d'instance de gen91 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré ») — même principe que gen81 : même type d'erreur, à
 * la même étape, dans toutes les séries.
 *
 * - La VARIANTE fixe le type d'erreur.
 * - `forme` = type d'erreur + exercice support (+ sous-variante du défaut quand il y en a deux, ex.
 *   « norme|isocele|carre ») : la même erreur, dans le même exercice ; seuls les nombres et la
 *   POSITION de la ligne fausse (0 à 3 lignes justes avant elle, tirée) changent d'une série à
 *   l'autre — la ligne n'est plus dans `forme` (audit 4e ch. 6, lot D : la série B reproduisait la
 *   même ligne, réponse de l'écran 1). Le type d'erreur (réponse de l'écran 2) : groupe à verdict
 *   `groupe_erreur` du panneau (`exportEvaluation.ts`).
 * - Le VERDICT d'une question à décider (isocèle, alignés, rectangle) n'entre PAS dans `forme` :
 *   il reste tiré à pile ou face dans chaque série, et la copie l'inverse ou non selon les nombres.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, nommer, corriger).
 * - Pas de `calcul` : toutes les instances sont exactes (entiers, demi-entiers, racines carrées).
 */
export function formeDetectiveVecteurs(e: ExerciceDetectiveVecteurs): string {
  const s = SCENARIOS[e.scenario];
  return [s.type, s.support, ...(e.sousVariante ? [e.sousVariante] : [])].join("|");
}

export function profilDetectiveVecteurs(e: ExerciceDetectiveVecteurs): ProfilInstance {
  return { casParticulier: null, forme: formeDetectiveVecteurs(e) };
}
