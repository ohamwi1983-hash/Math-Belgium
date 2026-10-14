import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import {
  diagnostiquerCpReconnaissanceC,
  diagnostiquerCvReconnaissanceC,
  diagnostiquerReconnaissanceC,
  type ReponseReconnaissanceC,
} from "../moteur5e/verificationProblemesContexte";
import { CONSIGNE_RECONNAISSANCE_C, consigneContexteC, texteAideReconnaissanceC1 } from "../ui5e/formatProblemesContexte";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ScenarioCGraph } from "./ScenarioCGraph";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceScenarioC;
  /** Bloc "données" persistant (contexte du scénario C) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données -> question, jamais l'inverse). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseReconnaissanceC) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapeReconnaissanceC({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [cv, setCv] = useState("");
  const [cp, setCp] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = cv.trim() !== "" && cp.trim() !== "";
  const cvErronee = montrerErreurs && cv.trim() !== "" && diagnostiquerCvReconnaissanceC(exercice, cv) !== "correct";
  const cpErronee = montrerErreurs && cp.trim() !== "" && diagnostiquerCpReconnaissanceC(exercice, cp) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { cv, cp };
    setDernierStatut(diagnostiquerReconnaissanceC(exercice, reponse));
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneContexteC()}
        blocDonnees={
          <>
            {donnees}
            <ScenarioCGraph exercice={exercice} courbes="cvCp" />
          </>
        }
      />
      <p className="prompt-text">{CONSIGNE_RECONNAISSANCE_C}</p>
      <ApercuExpressionLatex texte={cv} label="CV(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">CV(x) =</label>
        <input type="text" className={`text-input${cvErronee ? " is-erronee" : ""}`} value={cv} onChange={(e) => setCv(e.target.value)} placeholder="ex : 5*sqrt(x)" />
      </div>
      <ApercuExpressionLatex texte={cp} label="CP(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">CP(x) =</label>
        <input type="text" className={`text-input${cpErronee ? " is-erronee" : ""}`} value={cp} onChange={(e) => setCp(e.target.value)} placeholder="ex : 2*x" />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideReconnaissanceC1(exercice)}</p>
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
