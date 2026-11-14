import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceGrandsNombres, IdVarianteGrandsNombres } from "../../core6e/grandsNombresLog";

/**
 * Profil de tirage équilibré de `6gen92` « Grands nombres et logarithme décimal »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance a toutes ses étapes ; le verdict d'une comparaison n'en
 *   est jamais un (tiré au hasard dans chaque série, issues équilibrées).
 * - `forme` = variante + sous-cas : `chiffres`, `premier-chiffre`, `comparer:logs`,
 *   `comparer:exact`, `temps:duree`, `temps:taille` — la série A fixe le sous-cas, les autres séries
 *   le reproduisent avec d'autres nombres.
 * - `calcul` : `exacte` pour la comparaison par un même exposant (sans calculatrice), `calculatrice`
 *   partout ailleurs (n·log(a) n'est jamais une valeur remarquable).
 */
export function profilGrandsNombres(e: ExerciceGrandsNombres): ProfilInstance {
  switch (e.variante) {
    case "chiffres":
    case "premier-chiffre":
      return { casParticulier: null, calcul: "calculatrice", forme: e.variante };
    case "comparer":
      return { casParticulier: null, calcul: e.sousCas === "exact" ? "exacte" : "calculatrice", forme: `comparer:${e.sousCas}` };
    case "temps":
      return { casParticulier: null, calcul: "calculatrice", forme: `temps:${e.sousCas}` };
  }
}

/** Variantes sans AUCUNE instance faisable sans calculatrice (exclues d'une évaluation « calculatrice interdite »). */
export const VARIANTES_CALCULATRICE_GRANDS_NOMBRES: IdVarianteGrandsNombres[] = ["chiffres", "premier-chiffre", "temps"];
