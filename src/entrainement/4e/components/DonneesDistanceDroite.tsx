import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import { formatEnonceLatex } from "../ui/formatDistanceDroite";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceDistanceDroite;
}

/**
 * Bloc de données — les données FIXES du problème (jamais P/b/Q, dynamiques), identiques sur les 4
 * écrans (`promptgen47modifications.md`, points 2 et 6) : $d_1$/$d_2$ en système à accolade
 * (variante "paralleles", point 12) ou $d$ et $P$ sur deux lignes empilées (variante "point").
 */
export function DonneesDistanceDroite({ exercice }: Props) {
  return (
    <div className="equation-box">
      <Katex expression={formatEnonceLatex(exercice)} block />
    </div>
  );
}
