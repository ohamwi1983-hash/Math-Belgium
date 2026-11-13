import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceChantierTerrains } from "../../core/chantierTerrains.types";

/**
 * Profil d'instance de gen88 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe déjà la situation (alignement, équerre, parallèles, milieu, enclos, piquet).
 * - `forme` = la situation, plus ce qui change la démarche SANS trahir la réponse : alignement —
 *   le troisième point entre les deux autres ou au-delà ; piquet — ligne d'abscisse fixe (inconnue
 *   y) ou d'ordonnée fixe (inconnue x). Le VERDICT (alignés ou non, d'équerre ou non, parallèles ou
 *   non) n'entre JAMAIS dans le profil : il reste tiré à 50/50 dans chaque série, sinon la réponse
 *   de la série B se déduirait de celle de la série A.
 * - Aucun cas particulier : aucun vecteur utile n'a de composante nulle, toutes les étapes sont
 *   toujours à faire. Un verdict n'est jamais un cas particulier.
 * - `calcul` absent : coordonnées entières, tout est exact, sans calculatrice.
 */
export function formeChantierTerrains(e: ExerciceChantierTerrains): string {
  if (e.situation === "alignement") return `alignement:${e.position}`;
  if (e.situation === "piquet") return `piquet:${e.ligne!.axe}`;
  return e.situation;
}

export function profilChantierTerrains(e: ExerciceChantierTerrains): ProfilInstance {
  return { casParticulier: null, forme: formeChantierTerrains(e) };
}
