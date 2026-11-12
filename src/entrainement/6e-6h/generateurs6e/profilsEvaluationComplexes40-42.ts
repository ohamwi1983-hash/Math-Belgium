/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 6gen40 (transformations du plan), 6gen41 (triangles) et 6gen42 (compléments) — chapitre 5 de 6e
 * « Nombres complexes ». Décisions de l'utilisateur (`.claude/rules/feuilles-evaluations.md`, section
 * « Tirage équilibré ») :
 * - `forme` = famille / sous-type de l'exercice : la série A fixe, question par question, le TYPE de
 *   transformation (6gen40), le cas de triangle (6gen41 : isocèle, rectangle, les deux, aucun ;
 *   alignés / perpendiculaires / ni l'un ni l'autre…) ou le sous-type (6gen42) — les autres séries
 *   reproduisent cette structure avec d'autres nombres ;
 * - AUCUN cas particulier : chaque question de ces trois générateurs est un exercice complet, et
 *   leurs issues (isocèle ou non, cohérent ou non, parallèles ou non, |z′| = 1 ou non) sont des
 *   VERDICTS — jamais filtrés comme cas particuliers (mesures : voir le rapport du lot R3) ;
 * - `calcul` : valeurs exactes partout (affixes entières, angles remarquables, radicaux), SAUF
 *   6gen41 B (angles du triangle en degrés au dixième, loi des cosinus : calculatrice, 5 000 tirages
 *   sur 5 000) et 6gen42 E quand l'argument du rapport n'est pas un angle remarquable (« ni
 *   parallèles ni perpendiculaires », valeur approchée au centième). `calcul` est ABSENT pour 6gen40,
 *   dont toutes les instances sont exactes (un seul régime : aucune contrainte à appliquer).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceTransformationsPlan } from "../core6e/transformationsPlan.types";
import type { ExerciceTrianglesComplexes } from "../core6e/trianglesComplexes.types";
import type { ExerciceComplexesAvances, ExerciceComplexesE } from "../core6e/complexesAvances.types";
import { calculerArgument } from "./formeTrigonometrique/familleA";
import { ratioE } from "../moteur6e/verificationComplexesAvances";

// ---------------------------------------------------------------------------------------------
// 6gen40 — transformations du plan (`forme` = identifiant de variante du catalogue).
// ---------------------------------------------------------------------------------------------

export function formeTransformationsPlan(e: ExerciceTransformationsPlan): string {
  switch (e.famille) {
    case "A":
      return `A_${e.parametres.sousType}`;
    case "B":
      return `B_${e.sousType}`;
    case "C":
      return "C";
    case "D":
      return `D_${e.nature}`;
  }
}

export function profilTransformationsPlan(e: ExerciceTransformationsPlan): ProfilInstance {
  return { casParticulier: null, forme: formeTransformationsPlan(e) };
}

// ---------------------------------------------------------------------------------------------
// 6gen41 — triangles et nombres complexes.
// ---------------------------------------------------------------------------------------------

/** A : les 4 cas de triangle ; B : toujours isocèle (la variante le fixe) ; C : A centre ou non ;
 * D : cohérent ou non ; E : alignés / perpendiculaires / ni l'un ni l'autre. */
export function formeTrianglesComplexes(e: ExerciceTrianglesComplexes): string {
  switch (e.famille) {
    case "A":
      return `A_${e.sousType}`;
    case "B":
      return "B";
    case "C":
      return `C_${e.equidistant ? "centre" : "nonCentre"}`;
    case "D":
      return `D_${e.coherent ? "coherent" : "incoherent"}`;
    case "E":
      return `E_${e.position}`;
  }
}

export function profilTrianglesComplexes(e: ExerciceTrianglesComplexes): ProfilInstance {
  return { casParticulier: null, calcul: e.famille === "B" ? "calculatrice" : "exacte", forme: formeTrianglesComplexes(e) };
}

// ---------------------------------------------------------------------------------------------
// 6gen42 — compléments (lieux, équations à paramètre, parallélisme…).
// ---------------------------------------------------------------------------------------------

/** L'argument du rapport (z_D − z_C)/(z_B − z_A) est-il un angle remarquable ? (même test que
 * l'affichage du récapitulatif, `ui6e/formatComplexesAvances.ts::argumentLatexE`). */
export function argumentRemarquableE(e: ExerciceComplexesE): boolean {
  const r = ratioE(e);
  return calculerArgument(r.re, r.im).q !== 1e6;
}

export function formeComplexesAvances(e: ExerciceComplexesAvances): string {
  switch (e.famille) {
    case "A":
      return `A_n${e.n}`;
    case "B":
      return `B_${e.sousType}`;
    case "C":
      return "C";
    case "D":
      return `D_${e.sousType}`;
    case "E":
      return `E_${e.statut}`;
  }
}

export function profilComplexesAvances(e: ExerciceComplexesAvances): ProfilInstance {
  const calcul = e.famille === "E" && !argumentRemarquableE(e) ? "calculatrice" : "exacte";
  return { casParticulier: null, calcul, forme: formeComplexesAvances(e) };
}
