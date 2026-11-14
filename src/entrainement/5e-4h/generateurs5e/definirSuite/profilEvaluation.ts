import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDefinirSuite } from "../../core5e/definirSuite";

/**
 * Profil de tirage équilibré de `5gen44` « Définir et reconnaître une suite »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance a ses trois étapes. Le verdict des variantes `nature-*`
 *   (arithmétique, géométrique, ni l'une ni l'autre) n'en est jamais un : tiré au hasard dans chaque
 *   série, issues équilibrées (1/3 chacune).
 * - `forme` = signature de difficulté, jamais le verdict :
 *   `notations:{famille}:{double|precedent}` (affine, second degré, homographique, exponentielle ;
 *   u₂ₙ ou uₙ₋₁), `recurrence:{style}` (écriture de la relation), `nature-formule`,
 *   `nature-recurrence` (variante seule : l'écriture de la formule trahirait le verdict),
 *   `nature-termes:{4|5}` (nombre de termes, tiré indépendamment du verdict).
 *   Fréquence la plus rare dans sa variante : 1/8 (notations) — des milliers de correspondances
 *   attendues en 20 000 essais.
 * - Pas de `calcul` : toutes les valeurs sont exactes (entiers, fractions), aucune calculatrice.
 */
export function profilDefinirSuite(e: ExerciceDefinirSuite): ProfilInstance {
  switch (e.variante) {
    case "notations":
      return { casParticulier: null, forme: `notations:${e.famille}:${e.autre}` };
    case "recurrence":
      return { casParticulier: null, forme: `recurrence:${e.g.style}` };
    case "nature-formule":
    case "nature-recurrence":
      return { casParticulier: null, forme: e.variante };
    case "nature-termes":
      return { casParticulier: null, forme: `nature-termes:${e.termes.length}` };
  }
}
