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
    case "mixte":
      return partiesTriees(solution.morceaux, solution.points, formatMorceau, (v) => `{${v}}`).join(" ∪ ");
  }
}

function cleMorceau(morceau: Morceau): number {
  return morceau.borneGauche === "-inf" ? -Infinity : morceau.borneGauche === "+inf" ? Infinity : morceau.borneGauche;
}

/** Morceaux et points isolés d'une solution "mixte", dans l'ordre de la droite réelle. */
function partiesTriees(morceaux: Morceau[], points: number[], fMorceau: (m: Morceau) => string, fPoint: (v: number) => string): string[] {
  return [
    ...morceaux.map((m) => ({ cle: cleMorceau(m), texte: fMorceau(m) })),
    ...points.map((v) => ({ cle: v, texte: fPoint(v) })),
  ]
    .sort((a, b) => a.cle - b.cle)
    .map((p) => p.texte);
}

function formatBorneLatex(borne: Borne): string {
  if (borne === "-inf") return "-\\infty";
  if (borne === "+inf") return "+\\infty";
  return String(borne);
}

function formatMorceauLatex(morceau: Morceau): string {
  return `${morceau.crochetGauche}${formatBorneLatex(morceau.borneGauche)} \\,;\\, ${formatBorneLatex(morceau.borneDroite)}${morceau.crochetDroit}`;
}

/** Même ensemble que `formatSolutionEnsembleProduit`, en LaTeX (KaTeX) — accolades d'ensemble échappées. */
export function formatSolutionEnsembleProduitLatex(solution: SolutionEnsembleProduit): string {
  switch (solution.forme) {
    case "vide":
      return "\\varnothing";
    case "reel":
      return "\\mathbb{R}";
    case "point":
      return `\\{${solution.valeur}\\}`;
    case "reel_sauf_points":
      return `\\mathbb{R} \\setminus \\{${solution.valeurs.join(" \\,;\\, ")}\\}`;
    case "intervalle":
      return formatMorceauLatex(solution.morceau);
    case "union":
      return solution.morceaux.map(formatMorceauLatex).join(" \\cup ");
    case "mixte":
      return partiesTriees(solution.morceaux, solution.points, formatMorceauLatex, (v) => `\\{${v}\\}`).join(" \\cup ");
  }
}
