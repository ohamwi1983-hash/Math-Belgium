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
 * Étape "factorisation générale" : les racines sont révélées ICI (jamais à déduire de S/P — les
 * résoudre depuis une équation auxiliaire serait le calcul à plusieurs étapes déjà écarté des
 * quiz du chapitre 2), l'élève écrit a(x-x1)(x-x2)=0. Piège : oublier le coefficient a devant le
 * produit (même défaut que celui retiré du quiz "factorisationGenerale", ici dans le sens
 * construction plutôt que vérification).
 */
export function EtapeFactorisationRacines({
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
        Les racines de cette équation sont <Katex expression={formatRacinesRevelees(exercice.racines)} /> — écris la
        factorisation générale de cette équation à partir de ces racines.
      </p>
      <ApercuExpressionLatex texte={reponse} label="Factorisation =" />
      <div className="field">
        <label className="field-label" htmlFor="relrac-factorisation">
          Factorisation
        </label>
        <input
          id="relrac-factorisation"
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
                  La factorisation générale est <Katex expression="a(x-x_1)(x-x_2)=0" /> — n'oublie pas d'écrire le
                  coefficient a devant le produit, c'est le piège le plus fréquent de cette étape.
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
