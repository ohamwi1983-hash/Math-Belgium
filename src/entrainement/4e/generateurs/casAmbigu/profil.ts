import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceCasAmbigu } from "../../core/casAmbigu.types";

/**
 * Profil d'instance de gen74 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - Le nombre de triangles (0, 1 ou 2) est le VERDICT de l'exercice : jamais un cas particulier,
 *   jamais une `forme` — s'il était fixé par la série A et reproduit dans les autres séries, la
 *   réponse circulerait entre élèves. Le sous-cas sin B̂ = 1 (triangle rectangle) fait partie de
 *   l'issue « 1 triangle » : ce n'est pas non plus un cas particulier (c'est la question elle-même).
 * - La STRUCTURE de la résolution (écrans 3 et 5 : deux candidats, un seul, ou aucun ; un, deux ou
 *   zéro côté) découle entièrement de l'issue : l'égaliser reviendrait à imposer l'issue. `forme`
 *   n'égalise donc que ce qui ne révèle rien : le FORMAT DES DONNÉES, tiré indépendamment de
 *   l'issue — « entiers » (a et b entiers, ≈ 60 %) ou « decimal » (un des deux côtés avec une
 *   décimale, ≈ 40 %). Mêmes nombres de chiffres à manipuler d'une série à l'autre, rien de plus.
 * - `calcul: 'calculatrice'` toujours (sinus d'angles non remarquables ; Â = 30° n'est tiré que
 *   lorsqu'un triangle existe, où sin⁻¹ reste indispensable) — `calculatriceIndispensable: true`.
 */
export function formeCasAmbigu(e: ExerciceCasAmbigu): "entiers" | "decimal" {
  return Number.isInteger(e.a) && Number.isInteger(e.b) ? "entiers" : "decimal";
}

export function profilCasAmbigu(e: ExerciceCasAmbigu): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: formeCasAmbigu(e) };
}
