import type { ExerciceSuiteGeometrique } from "../core5e/suitesGeometriques.types";
import type { PhaseSuiteGeometrique } from "../moteur5e/typesSuiteGeometrique";
import { formatTermesEtatActuelSuiteGeometrique } from "../ui5e/formatSuiteGeometrique";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceSuiteGeometrique;
  phase: PhaseSuiteGeometrique;
}

/**
 * Bloc "état actuel" (5gen15) — récapitule les valeurs déjà CONFIRMÉES plus tôt dans la séquence
 * réelle de cet exercice (voir `formatTermesEtatActuelSuiteGeometrique`), y compris le doublement
 * B1/B2 quand `statutQ==="double"`. Composant PARTAGÉ (même patron que
 * `EtatActuelSuiteArithmetique`, 5gen14) — réutilisé par les 5 composants d'écran de ce générateur
 * (`EtapeChampSimpleSuiteGeometrique`, `EtapeTermesMultiplesSuiteGeometrique`, `EtapeTrouverQ`,
 * `EtapeSommeInfinie`, `EtapePoserEquationGeometrique`) — factorisé pour ne pas dupliquer 5 fois le
 * même rendu "bloc fitter". Ne rend rien (`null`) tant que rien n'est encore accumulable — la fonction pure
 * gère elle-même le cas "premier écran de la séquence", donc ce composant peut être inséré sans
 * condition sur chaque écran (y compris le tout premier, où il rend simplement `null`).
 */
export function EtatActuelSuiteGeometrique({ exercice, phase }: Props) {
  const termes = formatTermesEtatActuelSuiteGeometrique(exercice, phase);
  if (termes === null) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}
