import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { EcranExtremaBornes } from "../moteur5e/typesExtremaBornes";
import { consigneGeneraleExtremaBornes, formatDomaineLatex, formatFDeTLatex, questionFinaleExtremaBornes } from "../ui5e/formatExtremaBornes";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";

interface Props {
  exercice: ExerciceExtremaBornes;
  phase: EcranExtremaBornes;
}

/** En-tête PARTAGÉ par les 5 écrans de 5gen34 — consigne générale (contexte narratif) → bloc de
 * données (f(t), domaine [0;T]) → question finale persistante, TOUJOURS dans cet ordre (convention
 * transversale, CLAUDE.md "Structure d'écran"). Factorisé ici plutôt que dupliqué dans chacun des 5
 * composants d'écran. Les faits déjà confirmés sont désormais listés dans le récapitulatif "Ce
 * qu'on sait déjà" (`ui5e/recapitulatifExtremaBornes.ts`, câblé au niveau de `App5gen34.tsx`),
 * plutôt que rappelés ici. */
export function EnonceExtremaBornes({ exercice }: Props) {
  return (
    <>
      <p className="prompt-text">{consigneGeneraleExtremaBornes(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        <Katex expression={formatFDeTLatex(exercice)} />
        <Katex expression={formatDomaineLatex(exercice)} />
      </div>
      <QuestionFinale question={questionFinaleExtremaBornes()} />
    </>
  );
}
