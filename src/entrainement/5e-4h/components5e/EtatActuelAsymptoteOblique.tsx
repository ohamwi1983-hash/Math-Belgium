import type { ExerciceAsymptoteOblique } from "../core5e/asymptoteOblique.types";
import type { PhaseAsymptoteOblique } from "../moteur5e/typesAsymptoteOblique";
import { formatTermesEtatActuelLatex } from "../ui5e/formatAsymptoteOblique";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceAsymptoteOblique;
  phase: PhaseAsymptoteOblique;
}

/** Bloc "état actuel" partagé par tous les écrans de 5gen21 — rend `null` tant que rien n'est
 * encore accumulable (toujours le cas sur le tout premier écran de chaque variante). */
export function EtatActuelAsymptoteOblique({ exercice, phase }: Props) {
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
