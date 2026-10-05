import { useState } from "react";
import type { ExerciceValeursRemarquables } from "../core/valeursRemarquables.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import { formatEnonceCercleTrigLatex } from "../ui/formatValeursRemarquables";
import { diagnostiquerAnglePremierQuadrant } from "../moteur/verificationValeursRemarquables";
import { formatMessageErreur } from "../ui/messageErreur";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { AideAnglePremierQuadrantCercleTrig } from "./AideAnglePremierQuadrantCercleTrig";

interface Props {
  exercice: ExerciceValeursRemarquables;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
}

/**
 * Angle du premier quadrant : toujours l'une des 5 valeurs remarquables 0/30/45/60/90. Aide
 * réutilisée telle quelle depuis le générateur 14 (même nom d'écran, même mécanique — point
 * symétrique + pointillé de symétrie selon le cas orthogonal/central), grâce à sa prop désormais
 * typée structurellement (`AngleAvecPremierQuadrant`). Blocage numérique du champ (même mécanisme
 * que le générateur 14 — `bloquerSaisieNonNumerique.ts`, jamais réinventé).
 */
export function EtapeAnglePremierQuadrantVR({
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
        <label className="field-label" htmlFor="valeurs-remarquables-premier-quadrant">
          Angle du premier quadrant en degrés
        </label>
        <input
          id="valeurs-remarquables-premier-quadrant"
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
