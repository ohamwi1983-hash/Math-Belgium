import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceEquilibreForces } from "../../core/equilibreForces.types";

/**
 * Profil d'instance de gen90 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = situation + présence de la question de direction + nature de l'intensité, ex.
 *   « barque:direction:racine ». La situation et la direction sont déjà fixées par la variante ; la
 *   nature de l'intensité est tirée au hasard et fixée aussi : une racine à simplifier (k√m) est
 *   plus longue qu'un résultat entier, à consigne identique (« valeur exacte »), et un arrondi exige
 *   la calculatrice. Seuls les nombres changent d'une série à l'autre.
 *   Mesure (5 000 tirages par variante) : sans direction, entier / racine / arrondi ≈ 28,6 % chacun
 *   et le cas particulier ≈ 14,3 % ; avec direction, ≈ 33,3 % chacun — des milliers de
 *   correspondances attendues en 20 000 essais, aucune bride nécessaire.
 * - Cas particulier = F₃ HORIZONTALE OU VERTICALE (`axe`) : une composante nulle, l'intensité se lit
 *   directement (pas de Pythagore). Jamais avec la direction. Toujours exact : pas de `calcul`.
 * - `calcul` : `exacte` quand l'intensité est demandée exacte (entier ou racine) et qu'il n'y a pas
 *   d'angle ; `calculatrice` pour une intensité arrondie au dixième ou un angle (arc tangente).
 */
export const LIBELLE_CAS_EQUILIBRE_FORCES =
  "Inclure un cas particulier (force cherchée horizontale ou verticale : son intensité se lit directement)";

export function formeEquilibreForces(e: ExerciceEquilibreForces): string {
  return `${e.situation}:${e.direction ? "direction" : "sans-direction"}:${e.intensite}`;
}

export function profilEquilibreForces(e: ExerciceEquilibreForces): ProfilInstance {
  if (e.intensite === "axe") return { casParticulier: "f3-sur-un-axe", forme: formeEquilibreForces(e) };
  const calculatrice = e.direction || e.intensite === "arrondi";
  return { casParticulier: null, calcul: calculatrice ? "calculatrice" : "exacte", forme: formeEquilibreForces(e) };
}
