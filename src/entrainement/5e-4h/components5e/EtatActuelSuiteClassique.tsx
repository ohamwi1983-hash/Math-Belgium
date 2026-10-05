import type { ExerciceSuiteClassique } from "../core5e/suitesClassiques.types";
import type { PhaseSuiteClassique } from "../moteur5e/typesSuiteClassique";
import { elementsEtatActuel } from "../ui5e/formatSuiteClassique";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceSuiteClassique;
  phase: PhaseSuiteClassique;
}

/**
 * Bloc "état actuel" (5gen17) — même patron que `EtatActuelSuiteArithmetique`/
 * `EtatActuelSuiteGeometrique` (5gen14/5gen15) : rappelle, sur chaque écran APRÈS LE PREMIER d'un
 * même scénario, la réponse correcte des écrans déjà traversés (`elementsEtatActuel`, purement
 * dérivée de `exercice`, jamais de la saisie de l'élève). Composant PARTAGÉ, réutilisé par les 4
 * composants d'écran de ce générateur (`EtapeChampSimpleClassique`, `EtapeListeChampsClassique`,
 * `EtapeQCMClassique`, `EtapeSuitesFinalesCombinees`) — factorisé pour ne pas dupliquer 4 fois le
 * même rendu "bloc fitter" (fragments LaTeX ET texte brut mélangés, voir `ElementEtatActuel`). Ne
 * rend rien (`null`) tant que rien n'est encore accumulable — la fonction pure gère elle-même le cas
 * "premier écran de la séquence", donc ce composant peut être inséré sans condition sur chaque écran
 * (y compris le tout premier, où il rend simplement `null`).
 */
export function EtatActuelSuiteClassique({ exercice, phase }: Props) {
  const elements = elementsEtatActuel(exercice, phase);
  if (elements.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {elements.map((el, i) => (el.type === "latex" ? <Katex key={i} expression={el.expression} /> : <span key={i}>{el.texte}</span>))}
    </div>
  );
}
