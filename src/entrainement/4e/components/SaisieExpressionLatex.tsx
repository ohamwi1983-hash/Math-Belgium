import { expressionLibreVersLatex } from "../ui/formatExpressionLatex";
import { Katex } from "./Katex";

interface Props {
  /** Saisie brute de l'élève (syntaxe clavier : « / », « ^ », « sqrt(…) »…). */
  texte: string;
  /** Préfixe LaTeX (ex. « f(x) = »), rendu avec l'expression. */
  prefixeLatex?: string;
}

/**
 * Saisie d'expression d'un écran déjà clos, rendue en KaTeX pour la fiche « Ta réponse » des puces
 * cliquables (`FicheReponseEcran`) — même convertisseur que l'aperçu en direct
 * (`expressionLibreVersLatex`, `ApercuExpressionLatex`), donc l'élève relit exactement ce qu'il
 * voyait sous le champ. Saisie vide ou illisible : texte brut (jamais une erreur KaTeX).
 */
export function SaisieExpressionLatex({ texte, prefixeLatex }: Props) {
  const propre = texte.trim();
  if (propre === "") return <span>(champ vide)</span>;
  let latex: string;
  try {
    latex = expressionLibreVersLatex(propre);
  } catch {
    return <span>{propre}</span>;
  }
  return <Katex expression={prefixeLatex ? `${prefixeLatex} ${latex}` : latex} />;
}
