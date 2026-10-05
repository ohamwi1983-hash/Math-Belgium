import type { Borne, Morceau } from "../core/inequation.types";
import type { SolutionEnsembleProduit } from "../core/signesProduit.types";

function formatBorne(borne: Borne): string {
  if (borne === "-inf") return "-∞";
  if (borne === "+inf") return "+∞";
  return String(borne);
}

function formatMorceau(morceau: Morceau): string {
  return `${morceau.crochetGauche}${formatBorne(morceau.borneGauche)} ; ${formatBorne(morceau.borneDroite)}${morceau.crochetDroit}`;
}

/**
 * Représentation texte d'un ensemble-solution à morceaux/valeurs extensibles (prompt-corrections-
 * tableau-signes-3points.md, point 2) — même principe que formatSolutionEnsemble.ts (exercice
 * "tableau de signes"), fichier séparé car typé pour SolutionEnsembleProduit (nombre variable de
 * morceaux/valeurs), jamais partagé avec le type SolutionEnsemble limité à 2 morceaux fixes.
 */
export function formatSolutionEnsembleProduit(solution: SolutionEnsembleProduit): string {
  switch (solution.forme) {
    case "vide":
      return "∅";
    case "reel":
      return "ℝ";
    case "point":
      return `{${solution.valeur}}`;
    case "reel_sauf_points":
      return `ℝ \\ {${solution.valeurs.join(" ; ")}}`;
    case "intervalle":
      return formatMorceau(solution.morceau);
    case "union":
      return solution.morceaux.map(formatMorceau).join(" ∪ ");
  }
}
