import type { ExerciceReductionVectorielle, TermeReduction } from "../core/reductionVectorielle.types";
import { LIBELLES_FIGURE } from "../generateurs/reductionVectorielle/figures";

function formatTerme(terme: TermeReduction, estSuite: boolean): string {
  const { coefficient, origine, arrivee } = terme;
  const signe = coefficient < 0 ? "-" : estSuite ? "+" : "";
  const abs = Math.abs(coefficient);
  const coefTexte = abs === 1 ? "" : String(abs);
  return `${signe}${coefTexte}\\vec{${origine}${arrivee}}`;
}

/** L'expression à réduire, affichée dans un bloc mis en évidence — ex.
 * `\vec{FA}+\vec{FM}-\vec{OL}-2\vec{QS}`. */
export function formatExpressionLatex(exercice: ExerciceReductionVectorielle): string {
  return exercice.termes.map((terme, i) => formatTerme(terme, i > 0)).join("");
}

/** Un fragment LaTeX signé par terme (jamais l'expression entière concaténée) — pour un rendu
 * KaTeX terme par terme qui peut s'enrouler ENTRE les termes sur mobile (`.equation-box-termes`,
 * App.css), contournant le `white-space: nowrap` interne de KaTeX qui empêche tout retour à la
 * ligne à l'intérieur d'un bloc unique (jusqu'à 7 termes pour les variantes `hexagone`/
 * `triangleMedianes`, débordement confirmé sur mobile étroit — voir CLAUDE.md, corrections gen27). */
export function formatTermesLatex(exercice: ExerciceReductionVectorielle): string[] {
  return exercice.termes.map((terme, i) => formatTerme(terme, i > 0));
}

export function libelleFigure(exercice: ExerciceReductionVectorielle): string {
  return LIBELLES_FIGURE[exercice.figure];
}
