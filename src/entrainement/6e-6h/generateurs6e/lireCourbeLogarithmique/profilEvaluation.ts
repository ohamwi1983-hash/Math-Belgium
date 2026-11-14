import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { CourbeLog, ExerciceLireCourbeLogarithmique } from "../../core6e/lireCourbeLogarithmique.types";

/**
 * Profil de tirage équilibré de `6gen85` « Lire une courbe logarithmique » (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance demande toutes les étapes (asymptote, domaine, base,
 *   expression ; ou les quatre associations).
 * - `forme` = variante + sens de variation (base > 1 ou 0 < base < 1) + translations présentes
 *   (aucune, horizontale, verticale, les deux). En `associer`, les quatre courbes mêlent toujours les
 *   deux sens de variation : la forme retient les translations communes aux trois expressions de
 *   référence (E1, E2, E3). Fréquence la plus faible : 1/98 en `lecture` (base < 1 sans translation),
 *   1/25 en `associer` — loin du seuil de la recherche de graine (20 000 essais).
 * - `calcul` absent : toutes les valeurs sont exactes (lecture sur le quadrillage).
 */

function translations(c: number, d: number): string {
  if (c !== 0 && d !== 0) return "hv";
  if (c !== 0) return "h";
  if (d !== 0) return "v";
  return "aucune";
}

/** Translations des trois expressions de référence (les trois qui les partagent ; E4 en change une). */
function translationsReference(expressions: CourbeLog[]): string {
  for (const k of expressions) {
    if (expressions.filter((m) => m.c === k.c && m.d === k.d).length >= 3) return translations(k.c, k.d);
  }
  return "?";
}

export function profilLireCourbeLogarithmique(e: ExerciceLireCourbeLogarithmique): ProfilInstance {
  if (e.variante === "lecture") {
    const sens = e.courbe.base.num > e.courbe.base.den ? "croissante" : "decroissante";
    return { casParticulier: null, forme: `lecture-${sens}-${translations(e.courbe.c, e.courbe.d)}` };
  }
  return { casParticulier: null, forme: `associer-${translationsReference(e.expressions)}` };
}
