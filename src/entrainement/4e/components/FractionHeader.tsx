import type { ExerciceSimplification } from "../core/simplification.types";
import { Katex } from "./Katex";
import { formatFraction } from "../ui/formatSimplification";

interface Props {
  exercice: ExerciceSimplification;
}

/** Rappel de contexte affiché sur chaque écran de l'exercice "Simplifier" : la fraction d'origine. */
export function FractionHeader({ exercice }: Props) {
  return (
    <div className="equation-box">
      <Katex expression={formatFraction(exercice)} block />
    </div>
  );
}
