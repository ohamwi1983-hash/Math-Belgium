import type { ExerciceSuiteArithmetique } from "../core5e/suitesArithmetiques.types";
import type { PhaseSuiteArithmetique } from "../moteur5e/typesSuiteArithmetique";
import { formatTermesEtatActuelLatex } from "../ui5e/formatSuiteArithmetique";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceSuiteArithmetique;
  phase: PhaseSuiteArithmetique;
}

/**
 * Bloc "état actuel" (5gen14) — récapitule les valeurs déjà CONFIRMÉES plus tôt dans la séquence
 * réelle de cet exercice (voir `formatTermesEtatActuelLatex`). Composant PARTAGÉ, contrairement à
 * l'`EtatActuelCE` de 5gen1 (défini localement, un seul consommateur) : ici réutilisé par les 4
 * composants d'écran du générateur (`EtapeChampSimpleSuiteArithmetique`, `EtapeCoherenceJugement`,
 * `EtapePoserEquation`, `EtapeTermesMultiples`) — factorisé pour ne pas dupliquer 4 fois le
 * même rendu "bloc fitter". Ne rend rien (`null`) tant que rien n'est encore accumulable — la
 * fonction pure gère elle-même le cas "premier écran de la séquence", donc ce composant peut être
 * inséré sans condition sur chaque écran (y compris le tout premier, où il rend simplement `null`).
 */
export function EtatActuelSuiteArithmetique({ exercice, phase }: Props) {
  const termes = formatTermesEtatActuelLatex(exercice, phase);
  if (termes === null) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}
