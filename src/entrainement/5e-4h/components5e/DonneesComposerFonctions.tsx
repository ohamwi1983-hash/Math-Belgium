import type { ExerciceComposerFonctions } from "../core5e/composerFonctions.types";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceComposerFonctions;
}

/** Bloc "données" persistant, affiché sur les 5 écrans de 5gen3 — f(x) et g(x) restent toujours
 * visibles, l'élève n'a jamais à les retenir par cœur pour construire f∘g/g∘f. */
export function DonneesComposerFonctions({ exercice }: Props) {
  return (
    <div className="equation-box">
      <Katex expression={exercice.f.latex} block />
      <Katex expression={exercice.g.latex} block />
    </div>
  );
}
