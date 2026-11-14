import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceTangentesLog } from "../../core6e/tangentesLogarithmiques.types";

/**
 * Profil de tirage équilibré de `6gen87` « Tangentes aux courbes logarithmiques »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance fait ses trois étapes. Le NOMBRE de tangentes
 *   parallèles (une ou deux) est un verdict : il n'entre ni dans `forme` ni dans un cas particulier
 *   et reste tiré à 50/50 dans chaque série.
 * - `forme` = variante + famille de f (même règle de dérivation, même type de calcul d'une série à
 *   l'autre, nombres différents). Variante fixée par question : chaque forme a une fréquence ≥ 1/5.
 * - Pas de `calcul` : toutes les valeurs sont exactes (fractions, ln, e, √e), faisables sans
 *   calculatrice — le générateur reste disponible calculatrice autorisée comme interdite.
 */
export function profilTangentesLog(e: ExerciceTangentesLog): ProfilInstance {
  return { casParticulier: null, forme: `${e.variante}-${e.fonction.famille}` };
}
