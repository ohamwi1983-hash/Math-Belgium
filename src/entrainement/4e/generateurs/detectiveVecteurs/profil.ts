import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveVecteurs } from "../../core/detectiveVecteurs.types";
import { SCENARIOS } from "../../moteur/modeleDetectiveVecteurs";

/**
 * Profil d'instance de gen91 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré ») — même principe que gen81 : même type d'erreur, à
 * la même étape, dans toutes les séries.
 *
 * - La VARIANTE fixe le type d'erreur.
 * - `forme` = type d'erreur + exercice support + ligne fausse (+ sous-variante du défaut quand il y
 *   en a deux, ex. « norme|isocele|L4|carre ») : la même erreur, dans le même exercice, à la même
 *   étape de la copie ; seuls les nombres changent d'une série à l'autre. Dans une variante, chaque
 *   forme sort avec une probabilité d'au moins 25 % (scénarios et sous-variantes équiprobables,
 *   `index.ts`) : 20 000 essais suffisent largement.
 * - Le VERDICT d'une question à décider (isocèle, alignés, rectangle) n'entre PAS dans `forme` :
 *   il reste tiré à pile ou face dans chaque série, et la copie l'inverse ou non selon les nombres.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, nommer, corriger).
 * - Pas de `calcul` : toutes les instances sont exactes (entiers, demi-entiers, racines carrées).
 */
export function formeDetectiveVecteurs(e: ExerciceDetectiveVecteurs): string {
  const s = SCENARIOS[e.scenario];
  return [s.type, s.support, `L${s.ligne + 1}`, ...(e.sousVariante ? [e.sousVariante] : [])].join("|");
}

export function profilDetectiveVecteurs(e: ExerciceDetectiveVecteurs): ProfilInstance {
  return { casParticulier: null, forme: formeDetectiveVecteurs(e) };
}
