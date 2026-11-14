import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceEncadrerIntegrales } from "../core6e/encadrerIntegrales.types";

/**
 * Profil de tirage équilibré de `6gen79` « Comparer et encadrer des intégrales »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance fait toutes ses étapes. Les VERDICTS (signe de f,
 *   f ≤ g / f ≥ g / changement de signe, sens de variation d'une fonction monotone) ne sont jamais
 *   un cas particulier ni une composante de `forme` : ils restent tirés au hasard dans chaque série
 *   (signe 1/2–1/2, comparaison 1/3 chacune).
 * - `forme` = variante, + ordre des bornes pour le signe (bornes échangées = un écran de plus),
 *   + monotone / tableau de variations pour l'encadrement et la valeur moyenne.
 * - `calcul` : seulement pour l'encadrement et la valeur moyenne — `exacte` si m, M et les bornes
 *   sont rationnels, `calculatrice` s'ils font intervenir e, ln ou √. Le signe et la comparaison se
 *   décident toujours sans calculatrice et sans valeur numérique : pas de `calcul` (sans objet),
 *   ils restent donc disponibles calculatrice autorisée comme interdite.
 */
export function profilEncadrerIntegrales(e: ExerciceEncadrerIntegrales): ProfilInstance {
  switch (e.variante) {
    case "signe":
      return { casParticulier: null, forme: e.inverse ? "signe-inverse" : "signe-ordre" };
    case "comparer":
      return { casParticulier: null, forme: "comparer" };
    case "encadrer":
    case "moyenne":
      return { casParticulier: null, forme: `${e.variante}-${e.structure}`, calcul: e.calcul };
  }
}
