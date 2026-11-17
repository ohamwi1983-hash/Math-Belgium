import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDeuxDroitesPlan } from "../../core/deuxDroitesPlan.types";

/**
 * Profil d'instance de gen100 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = variante + type de données (fiche validée par l'utilisateur) : « positions » (deux
 *   droites) ; « plan-troisPoints », « plan-droitePoint », « plan-deuxDroites ». Avec la variante
 *   « positions » imposée, la forme sort à 100 % ; avec « plan », chaque type sort avec une
 *   probabilité de 1/3 (≈ 6 700 correspondances attendues sur 20 000 essais).
 * - Ce que l'élève doit DÉCIDER n'entre JAMAIS dans `forme` et n'est jamais un cas particulier :
 *   la position des deux droites (sécantes / parallèles / gauches, 1/3 chacune), le verdict
 *   oui/non du plan (1/2 chacun) et la raison — tirés au hasard dans chaque série, AVANT le reste.
 * - Aucun cas particulier : chaque instance demande toute la démarche.
 * - Pas de `calcul` : aucun calcul numérique (raisonnement sur le dessin).
 */
export function formeDeuxDroitesPlan(e: ExerciceDeuxDroitesPlan): string {
  return e.variante === "positions" ? "positions" : `plan-${e.type}`;
}

export function profilDeuxDroitesPlan(e: ExerciceDeuxDroitesPlan): ProfilInstance {
  return { casParticulier: null, forme: formeDeuxDroitesPlan(e) };
}
