import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { Katex } from "./Katex";

interface Props {
  fragments: FragmentConsigne[];
}

/**
 * Rendu d'un `FragmentConsigne[]` (texte brut mêlé à du LaTeX inline court) — extrait du pattern
 * `.map()` jusque-là dupliqué dans chaque `Consigne*.tsx` (`ConsigneGeneraleEquationDroite`,
 * `ConsigneGeneraleRelationsDroites`, `ConsigneExtractionCaracteristiquesDroite`,
 * `ConsigneCaracteristiquesDroiteEcran2`) — justifié maintenant que le même besoin apparaît aussi
 * dans des TEXTES D'AIDE à travers le chapitre 6 (notation indicée réelle x_A/x_{\vec u}, jamais un
 * caractère `_` littéral — `promptgen46etcorrectionstransversaleschapitre6.md`, points B.1/B.3).
 * Ne rend PAS de conteneur (ni `<p>`, ni `<span>` englobant) — l'appelant choisit son propre wrapper
 * (`<p className="prompt-text">`, `<p>` d'aide, etc), exactement comme le faisaient les anciens
 * `.map()` locaux.
 */
export function RenduFragments({ fragments }: Props) {
  return (
    <>
      {fragments.map((fragment, index) => (fragment.type === "texte" ? <span key={index}>{fragment.valeur}</span> : <Katex key={index} expression={fragment.valeur} />))}
    </>
  );
}
