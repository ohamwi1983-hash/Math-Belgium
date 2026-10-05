import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioB } from "../core5e/problemesContexte.types";
import { diagnostiquerF1EvaluationB, diagnostiquerF2EvaluationB, type ReponseEvaluationB } from "../moteur5e/verificationProblemesContexte";
import { TEXTE_AIDE_EVALUATION_B_1, consigneEvaluationB, formatTermesEtatActuelB } from "../ui5e/formatProblemesContexte";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceScenarioB;
  /** Bloc "données" persistant (contexte du scénario B) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données -> question, jamais l'inverse). */
  donnees: ReactNode;
  /** Continuité — a/b RETENUS (voir `moteur5e/sessionProblemesContexte.ts`). */
  aRetenu: number;
  bRetenu: number;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEvaluationB) => void;
}

function EtatActuelB({ exercice, aRetenu, bRetenu }: { exercice: ExerciceScenarioB; aRetenu: number; bRetenu: number }) {
  const termes = formatTermesEtatActuelB(exercice, "evaluation", aRetenu, bRetenu);
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

export function EtapeEvaluationB({ exercice, donnees, aRetenu, bRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [f1, setF1] = useState("");
  const [f2, setF2] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = f1.trim() !== "" && f2.trim() !== "";
  const f1Erronee = montrerErreurs && f1.trim() !== "" && diagnostiquerF1EvaluationB(exercice, aRetenu, bRetenu, Number(f1.replace(",", "."))) !== "correct";
  const f2Erronee = montrerErreurs && f2.trim() !== "" && diagnostiquerF2EvaluationB(exercice, aRetenu, bRetenu, Number(f2.replace(",", "."))) !== "correct";

  function valider() {
    if (!complet) return;
    onValider({ f1: Number(f1.replace(",", ".")), f2: Number(f2.replace(",", ".")) });
  }

  return (
    <div>
      {donnees}
      <EtatActuelB exercice={exercice} aRetenu={aRetenu} bRetenu={bRetenu} />
      <p className="prompt-text">{consigneEvaluationB(exercice)}</p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">f({exercice.xEval1}) =</label>
          <input type="text" className={`text-input${f1Erronee ? " is-erronee" : ""}`} value={f1} onChange={(e) => setF1(e.target.value.replace(/[^0-9.,-]/g, ""))} />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">f({exercice.xEval2}) =</label>
          <input type="text" className={`text-input${f2Erronee ? " is-erronee" : ""}`} value={f2} onChange={(e) => setF2(e.target.value.replace(/[^0-9.,-]/g, ""))} />
        </div>
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_EVALUATION_B_1}</p>
        </div>
      )}
    </div>
  );
}
