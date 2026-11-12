import type { FragmentConsigne } from "../core6e/quizNombresComplexes.types";
import { Katex } from "../components/Katex";

interface Props {
  fragments: FragmentConsigne[];
}

const PONCTUATION_INITIALE = /^([.,;:!?)»]+)(.*)$/s;

/**
 * Variante de `components/RenduFragments` pour le quiz 6gen68 : une ponctuation qui suit
 * immédiatement une formule (« $…$. », « $…$, ») est rendue DANS la formule, en `\text{…}`, pour
 * qu'un retour à la ligne ne laisse jamais un « . » isolé en début de ligne. (Un groupe
 * `white-space: nowrap` autour de la formule empêchait aussi les coupures internes de KaTeX après
 * un `=` et faisait déborder les longues égalités à 390 px.) Ne rend pas de conteneur, comme
 * `RenduFragments`.
 */
export function RenduFragmentsQuiz({ fragments }: Props) {
  const elements = [];
  for (let index = 0; index < fragments.length; index++) {
    const fragment = fragments[index];
    if (fragment.type === "texte") {
      elements.push(<span key={index}>{fragment.valeur}</span>);
      continue;
    }
    const suivant = fragments[index + 1];
    const ponctuation = suivant?.type === "texte" ? PONCTUATION_INITIALE.exec(suivant.valeur) : null;
    if (!ponctuation) {
      elements.push(<Katex key={index} expression={fragment.valeur} />);
      continue;
    }
    elements.push(<Katex key={index} expression={`${fragment.valeur}\\text{${ponctuation[1]}}`} />);
    if (ponctuation[2] !== "") elements.push(<span key={`${index}-suite`}>{ponctuation[2]}</span>);
    index++;
  }
  return <>{elements}</>;
}
