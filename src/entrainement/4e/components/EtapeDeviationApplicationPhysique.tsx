import { useState } from "react";
import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import { formatEnonceApplicationPhysique, segmentsConsigneDeviation } from "../ui/formatApplicationPhysique";
import { diagnostiquerDeviation } from "../moteur/verificationApplicationPhysique";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { RenduFragments } from "./RenduFragments";
import { SchemaApplicationPhysique } from "./SchemaApplicationPhysique";

interface Props {
  exercice: ExerciceApplicationPhysique;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (valeur: number) => void;
}

/** Angle de déviation entre la trajectoire/l'orientation de référence (v1) et la résultante —
 * trigonométrie de base (angle droit) ou loi des sinus (angle quelconque) selon la variante, déjà
 * calculé à la génération (`triangle.C`) — même principe que l'étape "norme". */
export function EtapeDeviationApplicationPhysique({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const valeur = Number(texte.replace(",", "."));
  const apresEchec = tentativesUtilisees > 0;
  const statut = complet ? diagnostiquerDeviation(exercice, valeur) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">{formatEnonceApplicationPhysique(exercice)}</p>
      <SchemaApplicationPhysique exercice={exercice} />

      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneDeviation(exercice)} />
      </p>
      <div className="field">
        <label className="field-label" htmlFor="application-physique-deviation">
          Angle de déviation
        </label>
        <div className="champ-avec-unite">
          <input
            id="application-physique-deviation"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={texte}
            onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
          <span className="champ-avec-unite-suffixe">°</span>
        </div>
      </div>
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
