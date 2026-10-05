import type { Borne, Morceau, SolutionEnsemble } from "../core/inequation.types";

function formatBorne(borne: Borne): string {
  if (borne === "-inf") return "-∞";
  if (borne === "+inf") return "+∞";
  return String(borne);
}

function formatMorceau(morceau: Morceau): string {
  return `${morceau.crochetGauche}${formatBorne(morceau.borneGauche)} ; ${formatBorne(morceau.borneDroite)}${morceau.crochetDroit}`;
}

/** Représentation texte d'un ensemble-solution, cohérente avec la notation de la saisie guidée. */
export function formatSolutionEnsemble(solution: SolutionEnsemble): string {
  switch (solution.forme) {
    case "vide":
      return "∅";
    case "reel":
      return "ℝ";
    case "point":
      return `{${solution.valeur}}`;
    case "reel_sauf_point":
      return `ℝ \\ {${solution.valeur}}`;
    case "intervalle":
      return formatMorceau(solution.morceau);
    case "union":
      return `${formatMorceau(solution.morceau1)} ∪ ${formatMorceau(solution.morceau2)}`;
  }
}
