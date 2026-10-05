import { useState } from "react";
import type { ExerciceCercleTrigonometrique } from "../core/cercleTrigonometrique.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import { formatEnonceCercleTrigLatex } from "../ui/formatCercleTrigonometrique";
import { diagnostiquerAnglePremierQuadrant } from "../moteur/verificationCercleTrigonometrique";
import { formatMessageErreur } from "../ui/messageErreur";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { AideAnglePremierQuadrantCercleTrig } from "./AideAnglePremierQuadrantCercleTrig";

interface Props {
  exercice: ExerciceCercleTrigonometrique;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
}

/** Angle du premier quadrant (angle de référence), toujours entre 0° et 90°. */
export function EtapeAnglePremierQuadrantCercleTrig({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const valeur = Number(texte.replace(",", "."));
  const statut = complet ? diagnostiquerAnglePremierQuadrant(exercice, valeur) : undefined;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatEnonceCercleTrigLatex(exercice.angleDepart)} block />
      </div>
      <p className="prompt-text">Quel est l'angle du premier quadrant associé à cet angle ?</p>
      <div className="field">
        <label className="field-label" htmlFor="cercle-trig-premier-quadrant">
          Angle du premier quadrant en degrés
        </label>
        <input
          id="cercle-trig-premier-quadrant"
          className={`text-input${tentativesUtilisees > 0 && statut && statut !== "correct" ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>
      <AideAnglePremierQuadrantCercleTrig exercice={exercice} aideActivee={aideActivee} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
