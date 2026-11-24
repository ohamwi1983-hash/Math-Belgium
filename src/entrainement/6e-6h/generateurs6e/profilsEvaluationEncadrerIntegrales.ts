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
 * - `calcul` : pour l'encadrement et la valeur moyenne — `exacte` si m, M et les bornes sont
 *   rationnels, `calculatrice` s'ils font intervenir e, ln ou √ (la calculatrice ne donne pas les
 *   bornes m(b − a), M(b − a) demandées : inchangé à la revue).
 * - Signe et comparaison « sans calculer I » : `exacte` (revue des profils, 24/11/2026 — `exacte`
 *   SEULEMENT si la calculatrice des élèves donne directement la réponse ; en 6e 6h, la Casio Graph
 *   Math+ calcule ∫ numériquement, donc I, son signe et l'ordre de I et J). Comparaison : TOUTE la
 *   variante, y compris l'issue « on ne peut pas conclure » (que la calculatrice ne donne pas) — ne
 *   garder que cette issue « calculatrice autorisée » rendrait le verdict prévisible (un verdict n'est
 *   jamais un cas particulier). Ces deux variantes sont donc grisées « calculatrice autorisée ».
 */
export function profilEncadrerIntegrales(e: ExerciceEncadrerIntegrales): ProfilInstance {
  switch (e.variante) {
    case "signe":
      return { casParticulier: null, forme: e.inverse ? "signe-inverse" : "signe-ordre", calcul: "exacte" };
    case "comparer":
      return { casParticulier: null, forme: "comparer", calcul: "exacte" };
    case "encadrer":
    case "moyenne":
      return { casParticulier: null, forme: `${e.variante}-${e.structure}`, calcul: e.calcul };
  }
}
