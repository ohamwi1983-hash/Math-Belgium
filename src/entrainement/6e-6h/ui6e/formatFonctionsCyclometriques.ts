import type { Arcfonction, Trigfonction } from "../core6e/cyclometrique.types";
import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";

/**
 * Textes de consigne/aide pour `6gen2` (REFONTE TOTALE). `src/ui6e/` peut dépendre de
 * `src/core6e/` (sens autorisé, voir CLAUDE.md Architecture). Toute aide qui doit montrer une
 * formule renvoie `{texte, latex}` (`latex` rendu via `<Katex block>`, `null` si rien à montrer).
 *
 * 2 niveaux d'aide UNIQUEMENT (spec), focalisés sur l'EXISTENCE — jamais sur le calcul de la
 * valeur finale elle-même (déjà pratiqué par d'autres générateurs du chapitre) :
 * (1) rappel de la condition à vérifier en premier ;
 * (2) cette condition déjà appliquée et son résultat indiqué — SANS jamais donner la conclusion
 *     finale (Existe/N'existe pas) ni la valeur demandée.
 */
export const CONSIGNE_GENERALE = "Cette expression existe-t-elle ? Si oui, donne sa valeur exacte.";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const NOM_LATEX: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };
const NOM_TRIG_LATEX: Record<Trigfonction, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };

// ============================================================================
// Expression affichée (bloc données) — un seul bloc KaTeX, jamais le détail du calcul composite.
// ============================================================================

export function formatExpressionLatex(exercice: ExerciceFonctionsCyclometriques): string {
  switch (exercice.variante) {
    case "directe":
      return `${NOM_LATEX[exercice.arcfonction]}\\left(${exercice.nombreLatex}\\right)`;
    case "arcTrig":
      return `${NOM_LATEX[exercice.arcfonction]}\\left(${NOM_TRIG_LATEX[exercice.trigfonction]}\\left(${exercice.theta.angle.latex}\\right)\\right)`;
    case "trigArc":
      return `${NOM_TRIG_LATEX[exercice.trigfonction]}\\left(${NOM_LATEX[exercice.arcfonction]}\\left(${exercice.nombreLatex}\\right)\\right)`;
  }
}

