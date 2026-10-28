import { useState } from "react";
import type { ExerciceRelationsRacines } from "../core/relationsRacines.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { formatRacinesRevelees } from "../ui/formatRelationsRacines";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { Katex } from "./Katex";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { BoutonAide } from "./BoutonAide";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceRelationsRacines;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  diagnostiquer: (valeur: string) => StatutVerification;
  onValider: (reponse: string) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "équation depuis les racines" (finale) : repart des MÊMES racines qu'à l'écran précédent
 * — convention a=1 du cours, x²-Sx+P=0, en réutilisant S/P déjà trouvés à l'écran 1. Piège :
 * signe oublié devant S (erreur de signe classique, déjà rencontrée dans le quiz du chapitre 2).
 */
export function EtapeEquationDepuisRacines({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  diagnostiquer,
  onValider,
  validation,
}: Props) {
  const [reponse, setReponse] = useState("");
  const statut = tentativesUtilisees > 0 ? diagnostiquer(reponse) : undefined;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">
        On repart des mêmes racines, <Katex expression={formatRacinesRevelees(exercice.racines)} /> — écris
        l'équation du second degré la plus simple (a = 1) qui admet ces deux racines, sous la forme x² − Sx + P = 0.
      </p>
      <ApercuExpressionLatex texte={reponse} label="Équation =" />
      <div className="field">
        <label className="field-label" htmlFor="relrac-equation">
          Équation
        </label>
        <input
          id="relrac-equation"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
        />
      </div>
      {!validation && (
        <>
          <div>
            {aideActivee && (
              <div className="triangle-quelconque-aide">
                <p>
                  Remplace S et P par les valeurs déjà trouvées à l'écran précédent dans <Katex expression="x^2-Sx+P=0" /> —
                  attention au signe devant S.
                </p>
              </div>
            )}
            <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
          </div>
          <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => onValider(reponse)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
