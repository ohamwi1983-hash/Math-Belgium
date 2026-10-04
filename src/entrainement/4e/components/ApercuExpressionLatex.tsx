import { useEffect, useState } from "react";
import { expressionLibreVersLatex } from "../ui/formatExpressionLatex";
import { Katex } from "./Katex";

interface Props {
  texte: string;
  /** Libellé plain-text affiché avant le rendu (ex. "f(x) ="), jamais dans la source LaTeX
   * elle-même (évite tout risque d'échappement) — repris tel quel du label du champ associé,
   * omis quand ce champ n'en a pas (ex. un champ "Réponse ="  générique). */
  label?: string;
}

/**
 * Aperçu LaTeX en direct d'un champ de saisie libre d'expression — composant transversal (4e/5e/6e),
 * voir `promptapercuexpressionlatex.md`. À poser juste AVANT le `<div className="field...">` du
 * champ concerné (jamais après — l'élève doit voir l'équation se former au-dessus de ce qu'il tape,
 * pas en dessous), avec le même libellé que le champ (`label`, si le champ en a un). Porte lui-même
 * `.contenu-conditionnel` (marge au-dessus, la classe transversale déjà établie pour tout contenu
 * révélé après coup, `App.css:1229` — même si ici la "révélation" est déclenchée par la frappe
 * plutôt que par un clic) + une marge en dessous pour rester détaché du champ qui suit.
 *
 * Ne vérifie JAMAIS la réponse (`expressionLibreVersLatex` reste indépendant de tout
 * `diagnostiquerXxx`) — un aperçu qui "ressemble" à une fraction bien formée ne dit rien sur
 * l'exactitude de la réponse, seulement sur sa mise en forme. Pendant la frappe, une expression
 * syntaxiquement incomplète (ex. une parenthèse pas encore fermée) NE fait JAMAIS disparaître
 * l'aperçu ni planter le rendu : le dernier rendu valide reste affiché, assombri
 * (`.apercu-expression-latex-perime`), jusqu'à la prochaine frappe qui reparse avec succès.
 */
export function ApercuExpressionLatex({ texte, label }: Props) {
  const [dernierRenduValide, setDernierRenduValide] = useState<string | null>(null);

  let renduCourant: string | null;
  try {
    renduCourant = texte.trim() === "" ? null : expressionLibreVersLatex(texte);
  } catch {
    renduCourant = null;
  }

  useEffect(() => {
    if (renduCourant !== null) setDernierRenduValide(renduCourant);
    else if (texte.trim() === "") setDernierRenduValide(null);
  }, [renduCourant, texte]);

  if (dernierRenduValide === null) return null;

  const perime = renduCourant === null;
  return (
    <div className={`apercu-expression-latex contenu-conditionnel${perime ? " apercu-expression-latex-perime" : ""}`}>
      {label && <span className="apercu-expression-latex-label">{label}</span>}
      <Katex expression={dernierRenduValide} />
    </div>
  );
}
