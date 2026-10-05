import { useState } from "react";
import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import { formatEnonceApplicationPhysique, OPTIONS_DIRECTION } from "../ui/formatApplicationPhysique";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { SchemaApplicationPhysique } from "./SchemaApplicationPhysique";

interface Props {
  exercice: ExerciceApplicationPhysique;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (direction: string) => void;
}

/** Dernière étape, clôture l'exercice : reformule la résultante dans son contexte — pas un
 * troisième nombre brut (déjà obtenus aux 2 étapes précédentes), mais la direction cardinale
 * réelle vers laquelle elle pointe (Nord toujours pris comme référence, simplification
 * documentée — voir `core/applicationPhysique.types.ts`). */
export function EtapeInterpretationApplicationPhysique({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onValider }: Props) {
  const [choix, setChoix] = useState<string | null>(null);
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">{formatEnonceApplicationPhysique(exercice)}</p>
      <SchemaApplicationPhysique exercice={exercice} />

      <p className="prompt-text">Dans quelle direction cardinale se dirige la résultante ?</p>
      <div className="options-grid-compact">
        {OPTIONS_DIRECTION.map((direction) => (
          <button
            key={direction}
            type="button"
            className={`btn${choix === direction ? " toggle-active" : ""}${erronee && choix === direction ? " is-erronee" : ""}`}
            onClick={() => setChoix(direction)}
          >
            {direction}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
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
