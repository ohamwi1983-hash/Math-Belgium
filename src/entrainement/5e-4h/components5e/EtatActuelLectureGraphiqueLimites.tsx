import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import type { PhaseLectureGraphiqueLimites } from "../moteur5e/typesLectureGraphiqueLimites";
import { formatTermesEtatActuelLatex } from "../ui5e/formatLectureGraphiqueLimites";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceLectureGraphiqueLimites;
  phase: PhaseLectureGraphiqueLimites;
}

/** Bloc "état actuel" — absent sur "completerLimites" (rien à récapituler avant lui), rappelle les
 * limites confirmées à l'écran 1 dès "nommerAsymptotes" (convention "à partir de l'écran 2"). */
export function EtatActuelLectureGraphiqueLimites({ exercice, phase }: Props) {
  const termes = formatTermesEtatActuelLatex(exercice, phase);
  if (termes === null) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} block />
      ))}
    </div>
  );
}
