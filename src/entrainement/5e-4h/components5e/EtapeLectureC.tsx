import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import {
  diagnostiquerCfLectureC,
  diagnostiquerCpLectureC,
  diagnostiquerCtLectureC,
  diagnostiquerCvLectureC,
  type ReponseLectureC,
} from "../moteur5e/verificationProblemesContexte";
import { TEXTE_AIDE_LECTURE_C_1, consigneLectureC } from "../ui5e/formatProblemesContexte";
import { ScenarioCGraph } from "./ScenarioCGraph";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceScenarioC;
  /** Bloc "données" persistant (contexte du scénario C) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données/graphe → question, jamais l'inverse). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLectureC) => void;
}

export function EtapeLectureC({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [cf, setCf] = useState("");
  const [cv, setCv] = useState("");
  const [cp, setCp] = useState("");
  const [ct, setCt] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = [cf, cv, cp, ct].every((v) => v.trim() !== "");
  const cfErronee = montrerErreurs && cf.trim() !== "" && diagnostiquerCfLectureC(exercice, Number(cf.replace(",", "."))) !== "correct";
  const cvErronee = montrerErreurs && cv.trim() !== "" && diagnostiquerCvLectureC(exercice, Number(cv.replace(",", "."))) !== "correct";
  const cpErronee = montrerErreurs && cp.trim() !== "" && diagnostiquerCpLectureC(exercice, Number(cp.replace(",", "."))) !== "correct";
  const ctErronee = montrerErreurs && ct.trim() !== "" && diagnostiquerCtLectureC(exercice, Number(ct.replace(",", "."))) !== "correct";

  function valider() {
    if (!complet) return;
    onValider({ cf: Number(cf.replace(",", ".")), cv: Number(cv.replace(",", ".")), cp: Number(cp.replace(",", ".")), ct: Number(ct.replace(",", ".")) });
  }

  return (
    <div>
      {donnees}
      <ScenarioCGraph exercice={exercice} />
      <p className="prompt-text">{consigneLectureC(exercice)}</p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">CF =</label>
          <input type="text" className={`text-input${cfErronee ? " is-erronee" : ""}`} value={cf} onChange={(e) => setCf(e.target.value.replace(/[^0-9.,-]/g, ""))} />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">CV =</label>
          <input type="text" className={`text-input${cvErronee ? " is-erronee" : ""}`} value={cv} onChange={(e) => setCv(e.target.value.replace(/[^0-9.,-]/g, ""))} />
        </div>
      </div>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">CP =</label>
          <input type="text" className={`text-input${cpErronee ? " is-erronee" : ""}`} value={cp} onChange={(e) => setCp(e.target.value.replace(/[^0-9.,-]/g, ""))} />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">CT =</label>
          <input type="text" className={`text-input${ctErronee ? " is-erronee" : ""}`} value={ct} onChange={(e) => setCt(e.target.value.replace(/[^0-9.,-]/g, ""))} />
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
          <p>{TEXTE_AIDE_LECTURE_C_1}</p>
        </div>
      )}
    </div>
  );
}
