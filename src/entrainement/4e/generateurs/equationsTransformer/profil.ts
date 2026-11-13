import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceEquationsTransformer } from "../../core/equationsTransformer.types";
import { estSurAxe } from "../../moteur/modeleEquationsTransformer";

/**
 * Profil d'instance de gen78 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = forme de l'équation (la variante) + nombre d'équations de base, ex. « produit:2 »,
 *   « affine-cos:1 » : même nombre d'écrans d'une série à l'autre, nombres différents. Pour le
 *   CARRÉ, la variante seule : le nombre d'équations de base (0 si le carré vaut un négatif, 2
 *   sinon) est le verdict de la question ; l'imposer à toutes les séries ferait circuler la
 *   réponse « pas de solution » (le cas 1, k = 0, est le cas particulier).
 * - L'absence de solution (|k| > 1 pour sin/cos, carré négatif, facteur impossible) est un VERDICT :
 *   jamais un cas particulier (le filtrer rendrait la réponse prévisible). Elle sort au hasard,
 *   environ une fois sur sept pour sin/cos et le carré.
 * - Cas particulier = une équation de base « sur un axe » (k = 0, ou k = ±1 pour sin/cos) dans les
 *   formes affine et carré : l'angle de référence est immédiat (0° ou 90°) et les solutions tombent
 *   sur les axes. Le facteur nu f(α) = 0 du produit est la forme normale du produit nul, pas un cas
 *   particulier.
 * - `calcul` : 'calculatrice' dès qu'une valeur est décimale non remarquable (angles au dixième de
 *   degré), 'exacte' sinon (valeurs remarquables, sans calculatrice). Absent pour le cas
 *   particulier (toujours exact) : sinon la case « cas particulier » serait sans effet quand la
 *   calculatrice est autorisée (même choix que gen14–gen18).
 *
 * Mesures (5 000 tirages par variante, `scratchpad/gen78/sim78.mts`) : voir le rapport de gen78 —
 * chaque forme complète, sous chaque contrainte de calcul, reste tirée bien au-delà de 5
 * correspondances attendues en 20 000 essais.
 */
export const LIBELLE_CAS_EQUATIONS_TRANSFORMER = "Inclure un cas particulier (une équation de base sur un axe : k = 0 ou ±1)";

export function formeEquationsTransformer(e: ExerciceEquationsTransformer): string {
  return e.variante.startsWith("carre") ? e.variante : `${e.variante}:${e.bases.length}`;
}

export function profilEquationsTransformer(e: ExerciceEquationsTransformer): ProfilInstance {
  const surAxe = e.variante !== "produit" && e.bases.some((b) => estSurAxe(b.fonction, b.k));
  if (surAxe) return { casParticulier: "valeur-sur-axe", forme: formeEquationsTransformer(e) };
  return { casParticulier: null, forme: formeEquationsTransformer(e), calcul: e.calculatrice ? "calculatrice" : "exacte" };
}
