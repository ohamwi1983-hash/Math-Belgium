// Copie 5e (6h) de `5e-4h/components5e/TexteMathsClassique.tsx` (56gen8 ← 5gen17, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { Fragment } from "react";
import { Katex } from "../../../../5e-4h/components/Katex";

interface Props {
  /** Mini-syntaxe « texte avec $formule$ » (`ui5e/formatSuiteClassique.ts`). */
  texte: string;
}

/**
 * Rendu d'un texte mêlant prose et formules (5gen17) : la prose reste du texte normal (espaces,
 * accents, retour à la ligne sur téléphone), seules les portions entre `$…$` passent par KaTeX en
 * mode inline. Remplace le rendu de phrases entières en mode maths (lettres collées, lignes
 * tronquées — audit 5e ch. 3, point 7). Pas de conteneur : l'appelant choisit son élément.
 */
export function TexteMathsClassique({ texte }: Props) {
  return (
    <>
      {texte.split("$").map((morceau, i) =>
        i % 2 === 1 ? <Katex key={i} expression={morceau} /> : <Fragment key={i}>{morceau}</Fragment>,
      )}
    </>
  );
}
