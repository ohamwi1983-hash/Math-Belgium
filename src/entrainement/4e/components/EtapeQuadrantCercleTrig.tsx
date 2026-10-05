import { useState } from "react";
import type { ExerciceCercleTrigonometrique, Quadrant } from "../core/cercleTrigonometrique.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import { formatEnonceCercleTrigLatex } from "../ui/formatCercleTrigonometrique";
import { CercleQuadrantSelecteur } from "./CercleQuadrantSelecteur";

interface Props {
  exercice: ExerciceCercleTrigonometrique;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (quadrant: Quadrant) => void;
}

/**
 * Écran "Quadrant" (correction 3) : cercle interactif à la place du QCM textuel — l'élève sélectionne un
 * quadrant ou un axe (surbrillance unique et exclusive), la validation se base sur la sélection en
 * cours au moment du clic sur "Valider". Ce sélecteur ne montre jamais l'angle de l'énoncé (voir
 * CercleQuadrantSelecteur.tsx). **Aucun bouton "Aide" sur cet écran**
 * (promptcorrectionsgenerateur14aides.md, section 1 : l'ancienne aide générique, identique sur les
 * 4 écrans, est retirée — remplacée par 3 aides spécifiques sur les écrans "Réduction", "Angle du
 * premier quadrant" et "Signes", jamais sur "Quadrant") : le sélecteur interactif lui-même EST déjà
 * la représentation visuelle de cet écran, rien à ajouter derrière un bouton "Aide" ici.
 */
export function EtapeQuadrantCercleTrig({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  onValider,
}: Props) {
  const [selection, setSelection] = useState<Quadrant | null>(null);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatEnonceCercleTrigLatex(exercice.angleDepart)} block />
      </div>
      <p className="prompt-text">Dans quel quadrant ou sur quel axe se trouve cet angle ?</p>

      <CercleQuadrantSelecteur selection={selection} onSelectionner={setSelection} />

      <button
        type="button"
        className="btn btn-primary"
        disabled={selection === null}
        onClick={() => selection !== null && onValider(selection)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
