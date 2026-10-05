import type { EtatSessionCaracteristiquesAlgebriques } from "../moteur/typesCaracteristiquesAlgebriques";
import {
  formatBranchesAvecConditionsLatex,
  formatEquationDebarrasseeLatex,
  formatEquationDeveloppeeLatex,
  formatEquationIsoleeLatex,
  formatEquationsSepareesLatex,
} from "./formatCaracteristiquesAlgebriques";

/**
 * "État actuel" de la séquence "zéros" (`prompt-corrections-ecrans-zeros.md`, point 2, étendu par
 * `prompt-3-ameliorations-finales.md`, point 2, puis par `prompt-corrections-niveau2-vague2.md`,
 * point 4b) — même principe que `calculerEtatActuel` (exercice 1) : dérivé uniquement des scores
 * déjà trackés par le moteur (jamais de la saisie de l'élève, même principe de pureté que
 * `recapitulatif.ts`) :
 * - `null` tant que l'étape "isolement" n'est pas encore confirmée (écran "isolement" lui-même —
 *   rien à montrer avant la toute première confirmation de la séquence, même principe que
 *   `EtapeIsolement`/`EtapeReconnaissance` de l'exercice 1, qui n'affichent jamais ce bloc).
 * - l'équation isolée une fois "isolement" confirmé — reste affichée telle quelle sur l'écran
 *   "séparation"/"debarrasser"/"validite"/"regroupe" (aucune de ces étapes n'a encore rien confirmé
 *   de plus à ce stade).
 * - (niveau 1) les deux équations séparées une fois "séparation" confirmé (familles
 *   `valeur_absolue`/`carre` uniquement) — REMPLACE l'équation isolée sur l'écran "zéros" qui suit.
 * - (niveau 1) l'équation isolée ET l'équation "débarrassée" (familles `inverse`/`racine_carree`/
 *   `racine_cubique`/`cube` uniquement) une fois "debarrasser" confirmé — ACCUMULE (contrairement à
 *   la séparation, qui remplace) sur l'écran "zéros" qui suit, les deux équations empilées via
 *   `\begin{gathered}...\end{gathered}`.
 * - (niveau 2, `inverse`/`racine_carree`/`racine_cubique`) l'équation isolée ET l'équation
 *   "regroupée" une fois "regroupe" confirmé — ACCUMULE, même principe que "debarrasser" au niveau
 *   1, via `formatEquationDeveloppeeLatex` (qui couvre déjà ces 3 familles, voir sa documentation).
 * - (niveau 2, `valeur_absolue`) les deux équations de branche AVEC leurs conditions
 *   (`formatBranchesAvecConditionsLatex`, telles que produites/validées à l'étape "résolution des
 *   branches") une fois celle-ci confirmée — REMPLACE l'équation isolée `|ax+b|=-cx-d` sur l'écran
 *   "zéros" qui suit : l'élève doit continuer à voir le travail qu'il vient de produire, pas
 *   l'énoncé de départ (`prompt-corrections-niveau2-vague2.md`, point 4b).
 */
export function calculerEtatActuelCaracteristiquesAlgebriques(etat: EtatSessionCaracteristiquesAlgebriques): string | null {
  const exercice = etat.exerciceCourant;

  if (exercice.niveau === "niveau1" && etat.scoreSeparationExercice !== null) {
    return formatEquationsSepareesLatex(exercice);
  }

  if (exercice.niveau === "niveau1" && etat.scoreDebarrasserExercice !== null) {
    return `\\begin{gathered} ${formatEquationIsoleeLatex(exercice)} \\\\ ${formatEquationDebarrasseeLatex(exercice)} \\end{gathered}`;
  }

  if (exercice.niveau === "niveau2" && exercice.famille === "valeur_absolue" && etat.scoreResolutionBranchesExercice !== null) {
    return formatBranchesAvecConditionsLatex(exercice.a, exercice.b, exercice.c, exercice.d, exercice.conditionValidite);
  }

  if (exercice.niveau === "niveau2" && etat.scoreRegroupeExercice !== null) {
    return `\\begin{gathered} ${formatEquationIsoleeLatex(exercice)} \\\\ ${formatEquationDeveloppeeLatex(exercice)} \\end{gathered}`;
  }

  if (etat.scoreIsolementExercice !== null) {
    return formatEquationIsoleeLatex(exercice);
  }

  return null;
}
