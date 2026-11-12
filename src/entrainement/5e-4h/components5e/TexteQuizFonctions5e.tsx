import { Katex } from "../components/Katex";

interface Props {
  texte: string;
}

const PONCTUATION_INITIALE = /^([.,;:!?)»]+)(.*)$/s;

/**
 * Rendu d'une affirmation du quiz 5gen39 écrite avec `$…$` (segments impairs = LaTeX, même
 * convention que `RichText` du site). Comme `RenduFragmentsQuiz` (6e) : une ponctuation qui suit
 * immédiatement une formule est rendue DANS la formule (`\text{…}`), pour qu'un retour à la ligne
 * ne laisse jamais un « . » isolé en début de ligne. Ne rend pas de conteneur.
 */
export function TexteQuizFonctions5e({ texte }: Props) {
  const morceaux = texte.split("$");
  const elements = [];
  for (let index = 0; index < morceaux.length; index++) {
    const valeur = morceaux[index];
    if (index % 2 === 0) {
      if (valeur !== "") elements.push(<span key={index}>{valeur}</span>);
      continue;
    }
    const suivant = morceaux[index + 1] ?? "";
    const ponctuation = PONCTUATION_INITIALE.exec(suivant);
    if (!ponctuation) {
      elements.push(<Katex key={index} expression={valeur} />);
      continue;
    }
    elements.push(<Katex key={index} expression={`${valeur}\\text{${ponctuation[1]}}`} />);
    morceaux[index + 1] = ponctuation[2];
  }
  return <>{elements}</>;
}
