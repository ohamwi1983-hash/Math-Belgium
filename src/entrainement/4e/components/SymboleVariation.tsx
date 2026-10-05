import type { ValeurVariation } from "../core/analyseFonction.types";

interface Props {
  valeur: ValeurVariation;
}

/**
 * Point 5, prompt-4-modifications-analyse-fonction.md : les caractères Unicode "⌢"/"⌣" rendent une
 * courbure trop peu marquée selon la police (parfois indiscernable d'un simple trait). Remplacés
 * ici par un petit arc SVG dédié, à courbure nette — le modèle de données (`ValeurVariation`,
 * cycle, vérification) reste inchangé, seul le rendu du bouton change. Les flèches ↗/↘ restent du
 * texte, déjà suffisamment lisibles.
 */
export function SymboleVariation({ valeur }: Props) {
  if (valeur === "⌢") {
    return (
      <svg className="symbole-variation" viewBox="0 0 24 18" aria-label="maximum">
        <path d="M3,15 Q12,1 21,15" />
      </svg>
    );
  }
  if (valeur === "⌣") {
    return (
      <svg className="symbole-variation" viewBox="0 0 24 18" aria-label="minimum">
        <path d="M3,3 Q12,17 21,3" />
      </svg>
    );
  }
  return <>{valeur}</>;
}
