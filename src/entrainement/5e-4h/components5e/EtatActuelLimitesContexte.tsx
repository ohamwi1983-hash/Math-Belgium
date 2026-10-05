import type { ExerciceLimitesContexte } from "../core5e/limitesContexte.types";
import type { PhaseLimitesContexte } from "../moteur5e/typesLimitesContexte";
import { formatTermesEtatActuelLatex } from "../ui5e/formatLimitesContexte";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceLimitesContexte;
  phase: PhaseLimitesContexte;
}

/** Bloc "état actuel" — absent sur le tout premier écran, rappelle les réponses confirmées des
 * écrans précédents dès l'écran 2 (convention transversale de la plateforme). */
export function EtatActuelLimitesContexte({ exercice, phase }: Props) {
  const termes = formatTermesEtatActuelLatex(exercice, phase);
  if (termes === null) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} block={t.includes("\\lim_{")} />
      ))}
    </div>
  );
}
