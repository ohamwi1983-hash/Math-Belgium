import type { ReactNode } from "react";
import { Katex } from "../components/Katex";
import { expressionLibreVersLatex } from "../ui/formatExpressionLatex";
import { saisieTexte } from "../../4e/ui/historiqueProgression";

/**
 * Saisie libre de l'élève (valeur exacte, expression) telle qu'elle s'affiche dans la fiche d'une
 * puce (`FicheReponseEcran`) : rendue en KaTeX par le MÊME lecteur que l'aperçu du champ 6e
 * (`ApercuExpressionLatex` : π, √, « pi », « rac »), virgule décimale — jamais la notation clavier
 * brute. Saisie non analysable : affichée telle quelle (typographie seulement).
 */
export function saisieEnLatex6e(texte: string): ReactNode {
  const s = texte.trim();
  if (s === "") return "—";
  try {
    return <Katex expression={expressionLibreVersLatex(s.replace(/(\d),(\d)/g, "$1.$2")).replace(/(\d)\.(\d)/g, "$1{,}$2")} />;
  } catch {
    return saisieTexte(s);
  }
}
