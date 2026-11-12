/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`,
 * méthode : `.claude/rules/feuilles-evaluations.md`) de 5gen5 (problèmes en contexte), chapitre 1 de
 * 5e. Mesures : 5 000 tirages par variante (scratchpad r3c1/mesure.txt).
 *
 * `forme` = la variante (A1, A2, B1…B5, C-formeCV-formeCA) : une série B reprend le même scénario et
 * le même modèle que la série A, avec d'autres nombres.
 *
 * Aucun cas particulier : chaque scénario impose toujours les mêmes étapes (rien ne raccourcit la
 * résolution d'une instance à l'autre).
 *
 * `calcul` :
 * - A1 (bidons, V = πx²h) : `'calculatrice'` — π et une racine cubique à chaque instance
 *   (`calculatriceIndispensable: ["A1"]` dans l'adaptateur) ;
 * - A2 (stock et commande) : `'exacte'` — relevés entiers, équation du second degré à racine entière
 *   par construction, minimum lu sur le graphique ;
 * - B et C : sans objet — données décimales courtes (coûts unitaires au centième, tableau de valeurs
 *   au centième) et opérations élémentaires : faisables avec ou sans calculatrice.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceProblemeContexte } from "../core5e/problemesContexte.types";

export function formeProblemesContexte(e: ExerciceProblemeContexte): string {
  if (e.scenario === "A") return e.combo === "kInverseXAxCarre" ? "A1" : "A2";
  if (e.scenario === "B") return e.modele;
  return `C-${e.formeCV}-${e.formeCA}`;
}

export function profilProblemesContexte(e: ExerciceProblemeContexte): ProfilInstance {
  const forme = formeProblemesContexte(e);
  if (e.scenario === "A") return { casParticulier: null, calcul: e.combo === "kInverseXAxCarre" ? "calculatrice" : "exacte", forme };
  return { casParticulier: null, forme };
}
