import { useState } from "react";
import type { ExerciceValeursRemarquables } from "../core/valeursRemarquables.types";
import type { Quadrant } from "../core/cercleTrigonometrique.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import { formatEnonceCercleTrigLatex } from "../ui/formatValeursRemarquables";
import { AideReductionCercleTrig } from "./AideReductionCercleTrig";
import { CercleQuadrantSelecteur } from "./CercleQuadrantSelecteur";

interface Props {
  exercice: ExerciceValeursRemarquables;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (quadrant: Quadrant) => void;
}

/**
 * Écran "Quadrant" — réutilise tel quel le sélecteur interactif du premier générateur du chapitre
 * (`CercleQuadrantSelecteur`), déjà entièrement générique (aucune dépendance au contrat de cet
 * exercice au-delà du type `Quadrant`). Premier écran de la séquence (pas d'écran "Réduction" pour
 * ce générateur — `promptcreationgenerateur15.md`) : son aide réutilise donc directement
 * `AideReductionCercleTrig` du générateur 14 ("le cercle avec le rayon de l'angle"), grâce à sa prop
 * désormais typée structurellement (`AngleSurCercle`) — `exercice` la satisfait déjà tel quel.
 */
export function EtapeQuadrantVR({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, aideActivee, onActiverAide, onValider }: Props) {
  const [selection, setSelection] = useState<Quadrant | null>(null);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatEnonceCercleTrigLatex(exercice.angleDepart)} block />
      </div>
      <p className="prompt-text">Dans quel quadrant ou sur quel axe se trouve cet angle ?</p>

      <CercleQuadrantSelecteur selection={selection} onSelectionner={setSelection} />

      <AideReductionCercleTrig exercice={exercice} aideActivee={aideActivee} onActiverAide={onActiverAide} />
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
