import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceLorenzGini } from "../../core6e/lorenzGini";

/**
 * Profil de tirage équilibré de `6gen82` « Courbe de Lorenz et coefficient de Gini »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance a toutes ses étapes (aucun paramètre neutre ne raccourcit
 *   la résolution), et le verdict d'une comparaison n'en est jamais un.
 * - `forme` = variante + famille(s) de courbe : `lecture:puissance`, `lecture:mixte2`…,
 *   `pays:mixte2+puissance` (familles TRIÉES : l'ordre des deux courbes, donc le verdict, reste tiré
 *   au hasard dans chaque série), `parametre:mixte3`.
 * - `calcul` : `calculatrice` dès qu'une courbe exponentielle intervient, `exacte` pour une
 *   comparaison de polynômes ; ABSENT pour les variantes dont toutes les instances sont exactes
 *   (lecture d'un polynôme, paramètre) — une contrainte « calculatrice » y serait sans objet.
 */
export function profilLorenzGini(e: ExerciceLorenzGini): ProfilInstance {
  switch (e.variante) {
    case "lecture":
      return e.courbe.famille === "expo" ? { casParticulier: null, calcul: "calculatrice", forme: "lecture:expo" } : { casParticulier: null, forme: `lecture:${e.courbe.famille}` };
    case "comparaison": {
      const familles = e.courbes.map((c) => c.famille).sort();
      return { casParticulier: null, calcul: familles.includes("expo") ? "calculatrice" : "exacte", forme: `${e.contexte}:${familles.join("+")}` };
    }
    case "parametre":
      return { casParticulier: null, forme: `parametre:${e.famille}` };
  }
}

/** Variantes dont TOUTES les instances exigent la calculatrice. */
export const VARIANTES_CALCULATRICE_LORENZ = ["lecture-expo"];
