import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { EcranExtremaBornes } from "../moteur5e/typesExtremaBornes";
import { formatTermesEtatActuelLatex } from "../ui5e/formatExtremaBornes";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceExtremaBornes;
  phase: EcranExtremaBornes;
}

/** Bloc "état actuel" partagé par tous les écrans de 5gen34 — `null` sur le 1er écran (rien
 * n'est encore confirmé), accumule ensuite les faits confirmés — même patron que
 * `EtatActuelEtudeLocale.tsx` (5gen29). */
export function EtatActuelExtremaBornes({ exercice, phase }: Props) {
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
