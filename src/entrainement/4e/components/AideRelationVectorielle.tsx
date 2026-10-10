import type { ExerciceRelationVectorielle } from "../core/relationVectorielle.types";
import { valeursGrapheAide } from "../ui/formatRelationVectorielle";
import { VecteurGraph } from "./VecteurGraph";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceRelationVectorielle;
  aideActivee: boolean;
  onActiverAide: () => void;
}

/**
 * Aide UNIQUE, pénalisante (×0,5, `sessionRelationVectorielle.ts`) — même patron bouton+révélation
 * que le reste du projet (ex. `AideQuelAngle.tsx`) : le graphe révélé précède le bouton, qui reste
 * toujours affiché (désactivé + relabellisé "Aide utilisée" une fois activé). Contrairement au
 * générateur homonyme en position 21, le graphe n'est JAMAIS affiché par défaut ici — seulement
 * après activation, conformément à la spec de cette version guidée.
 */
export function AideRelationVectorielle({ exercice, aideActivee, onActiverAide }: Props) {
  const { points, vecteurs } = valeursGrapheAide(exercice);

  return (
    <div>
      {aideActivee && <VecteurGraph points={points} vecteurs={vecteurs} />}
      <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
    </div>
  );
}
