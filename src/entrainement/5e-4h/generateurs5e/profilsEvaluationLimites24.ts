/**
 * Profil d'instance de 5gen24 (« Étude complète », chapitre 4 de 5e) pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = structure VISIBLE dans l'énoncé : nombre de valeurs exclues, comportement à l'infini
 *   (AH nulle, AH non nulle, AO ou aucune — lisible sur les degrés) et recoupement (annoncé par
 *   l'énoncé papier). La NATURE de chaque valeur exclue (point vide ou asymptote verticale, simple ou
 *   double) est ce que l'élève DÉCIDE (« nature de chaque valeur exclue », signes des limites
 *   latérales) : c'est un verdict (lots B–D), retiré de la `forme` — la série B ne reproduit plus les
 *   natures de la série A. Les variantes dont le NOM dit ces natures sont réunies en groupes à verdict
 *   (`GROUPES_VERDICT_ETUDE_COMPLETE`, cinq variantes ajoutées en fin de catalogue pour que chaque
 *   structure ait au moins deux natures possibles). Seule « 1 exclusion — AO + recoupement » reste à
 *   part : un recoupement exige un dénominateur réduit de degré ≥ 2, donc une AV double.
 *   Le niveau et la durée suivent le nombre d'écrans (un point vide en ajoute un) : la copie
 *   d'évaluation n'imprime ni l'un ni l'autre (même choix que le groupe de techniques de 5gen10).
 *   Variante bonus : « construction inverse » avec AH ou AO.
 * - Aucun cas particulier : mesuré sur 5 000 tirages par famille, rien ne RACCOURCIT la résolution
 *   dans une même structure — b = 0 pour une AO (≈ 10 %) ou |a| = 1 (≈ 35 %) se calculent pareil,
 *   AH y = 0 est une famille à part entière, et le recoupement est une étape de PLUS. Pas de case.
 * - `calcul` sans objet : toutes les valeurs sont exactes (entiers, fractions).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceEtudeComplete } from "../core5e/etudeComplete.types";

export function formeEtudeComplete(e: ExerciceEtudeComplete): string {
  if (e.mode === "constructionInverse") return `construction-inverse|${e.proprietes.asymptote.type}`;
  const infini = e.infini.type === "horizontale" ? (e.infini.limite === 0 ? "ah-nulle" : "ah") : e.infini.type;
  return `${e.exclusions.length}-exclusions|${infini}${e.casSpecial ? "|recoupement" : ""}`;
}

/** Groupes à verdict : une rangée par structure visible, la nature des valeurs exclues tirée au hasard. */
export const GROUPES_VERDICT_ETUDE_COMPLETE = [
  { id: "groupe_1_ah_nulle", label: "1 exclusion — AH y = 0 (nature de l'asymptote verticale tirée au hasard)", formeCommune: true, variantes: ["1-vaSimple-ahZero", "1-vaDouble-ahZero"] },
  { id: "groupe_1_ah", label: "1 exclusion — AH non nulle (nature de l'asymptote verticale tirée au hasard)", formeCommune: true, variantes: ["1-vaSimple-ahNonNul", "1-vaDouble-ahNonNul"] },
  { id: "groupe_1_ao", label: "1 exclusion — AO (nature de l'asymptote verticale tirée au hasard)", formeCommune: true, variantes: ["1-vaSimple-ao", "1-vaDouble-ao"] },
  { id: "groupe_1_aucune", label: "1 exclusion — aucune asymptote à l'infini (nature de l'asymptote verticale tirée au hasard)", formeCommune: true, variantes: ["1-vaSimple-aucune", "1-vaDouble-aucune"] },
  { id: "groupe_2_ah", label: "2 exclusions — AH (nature des valeurs exclues tirée au hasard)", formeCommune: true, variantes: ["2-vaSimple-vaSimple-ah", "2-pointVide-vaSimple-ahNonNul"] },
  { id: "groupe_2_ao", label: "2 exclusions — AO (nature des valeurs exclues tirée au hasard)", formeCommune: true, variantes: ["2-vaSimple-vaSimple-ao", "2-vaDouble-vaDouble-ao", "2-pointVide-vaDouble-ao"] },
  { id: "groupe_2_aucune", label: "2 exclusions — aucune asymptote à l'infini (nature des valeurs exclues tirée au hasard)", formeCommune: true, variantes: ["2-pointVide-vaSimple-aucune", "2-vaSimple-vaSimple-aucune"] },
  { id: "groupe_2_ah_recoupement", label: "2 exclusions — AH + recoupement (nature des valeurs exclues tirée au hasard)", formeCommune: true, variantes: ["2-vaSimple-vaDouble-ahNonNul-special", "2-vaSimple-vaSimple-ahNonNul-special"] },
];

export function profilEtudeComplete(e: ExerciceEtudeComplete): ProfilInstance {
  return { casParticulier: null, forme: formeEtudeComplete(e) };
}
