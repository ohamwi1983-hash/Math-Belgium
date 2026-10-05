import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { EcranLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";
import { formatTermesEtatActuelLatex } from "../ui5e/formatLectureGraphiqueDerivees";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceLectureGraphiqueDerivees;
  phase: EcranLectureGraphiqueDerivees;
}

/** Bloc "état actuel" — absent sur le premier écran réellement traversé, accumule ensuite les
 * faits confirmés (voir `formatTermesEtatActuelLatex`) — même patron que 5gen22/5gen29. */
export function EtatActuelLectureGraphiqueDerivees({ exercice, phase }: Props) {
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
