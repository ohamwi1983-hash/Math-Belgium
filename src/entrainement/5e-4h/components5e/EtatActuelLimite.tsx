import type { ExerciceLimite } from "../core5e/limites.types";
import type { PhaseLimite } from "../moteur5e/typesLimites";
import { formatTermesEtatActuelLatex, limNecessiteModeDisplay } from "../ui5e/formatLimites";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceLimite;
  phase: PhaseLimite;
}

/** Bloc "état actuel" partagé par tous les écrans de 5gen20 — rend `null` tant que rien n'est
 * encore accumulable (toujours le cas sur "reconnaissance", premier écran de toute séquence). */
export function EtatActuelLimite({ exercice, phase }: Props) {
  const termes = formatTermesEtatActuelLatex(exercice, phase);
  if (termes === null) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} block={limNecessiteModeDisplay(t)} />
      ))}
    </div>
  );
}
