import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import type { PhaseSuiteRecurrenteAffine } from "../moteur5e/typesSuiteRecurrenteAffine";
import { formatTermesEtatActuelLatex } from "../ui5e/formatSuiteRecurrenteAffine";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceSuiteRecurrenteAffine;
  phase: PhaseSuiteRecurrenteAffine;
}

/**
 * Bloc "état actuel" (5gen19) — récapitule les valeurs déjà CONFIRMÉES plus tôt dans la séquence
 * FIXE (`poserRecurrence → regimePermanent → termesSuccessifs`) : la relation de récurrence dès
 * "regimePermanent", puis en plus le régime/L (ou "n'existe pas" si divergent) dès
 * "termesSuccessifs" (voir `formatTermesEtatActuelLatex`). Composant PARTAGÉ, réutilisé par les 3
 * écrans du générateur — ne rend rien (`null`) sur le tout premier écran ("poserRecurrence"), la
 * fonction pure gère elle-même ce cas, donc ce composant peut être inséré sans condition.
 */
export function EtatActuelSuiteRecurrenteAffine({ exercice, phase }: Props) {
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
