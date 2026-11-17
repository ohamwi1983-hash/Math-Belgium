import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceImpedances } from "../../core6e/impedancesComplexes";

/**
 * Profil de tirage équilibré de `6gen96` « Électricité : impédances complexes »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - `forme` = type de circuit (fiche validée) : `serie2` (R avec une bobine OU un condensateur),
 *   `rlc` (série RLC) ou `parallele` (R en parallèle avec une bobine OU un condensateur) — la
 *   variante elle-même. La série A fixe le type ; les autres séries le reprennent avec d'autres
 *   valeurs (des milliers d'énoncés distincts par type, voir `content-history.md`).
 * - La NATURE du circuit (inductif / capacitif / résistif) est le VERDICT de la dernière question :
 *   elle n'entre jamais dans `forme` (dans chaque type, elle reste tirée au hasard, à parts égales,
 *   d'une série à l'autre) et n'est jamais un cas particulier — pas même la résonance, qui
 *   raccourcit pourtant le calcul du module et de l'argument.
 * - Aucun cas particulier.
 * - `calcul: 'calculatrice'` pour toutes les instances (module, arctangente, intensité) : le
 *   générateur est déclaré `calculatriceIndispensable` (exclu d'une évaluation « calculatrice
 *   interdite ») ; `calcul` ne dépend donc jamais du verdict.
 */
export function profilImpedances(e: ExerciceImpedances): ProfilInstance {
  return { casParticulier: null, forme: e.variante, calcul: "calculatrice" };
}
