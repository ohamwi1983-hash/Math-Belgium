import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioB } from "../core5e/problemesContexte.types";
import { diagnostiquerAResolutionB, diagnostiquerBResolutionB, type ReponseResolutionB } from "../moteur5e/verificationProblemesContexte";
import { CONSIGNE_RESOLUTION_B, TEXTE_AIDE_RESOLUTION_B_1, formatTermesEtatActuelB } from "../ui5e/formatProblemesContexte";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceScenarioB;
  /** Bloc "données" persistant (contexte du scénario B) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données -> question, jamais l'inverse). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseResolutionB) => void;
}

function EtatActuelB({ exercice }: { exercice: ExerciceScenarioB }) {
  const termes = formatTermesEtatActuelB(exercice, "resolution", null, null);
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

export function EtapeResolutionB({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = a.trim() !== "" && b.trim() !== "";
  const aErronee = montrerErreurs && a.trim() !== "" && diagnostiquerAResolutionB(exercice, Number(a.replace(",", "."))) !== "correct";
  const bErronee = montrerErreurs && b.trim() !== "" && diagnostiquerBResolutionB(exercice, Number(b.replace(",", "."))) !== "correct";

  function valider() {
    if (!complet) return;
    onValider({ a: Number(a.replace(",", ".")), b: Number(b.replace(",", ".")) });
  }

  return (
    <div>
      {donnees}
      <EtatActuelB exercice={exercice} />
      <p className="prompt-text">{CONSIGNE_RESOLUTION_B}</p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">a =</label>
          <input type="text" className={`text-input${aErronee ? " is-erronee" : ""}`} value={a} onChange={(e) => setA(e.target.value.replace(/[^0-9.,-]/g, ""))} />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">b =</label>
          <input type="text" className={`text-input${bErronee ? " is-erronee" : ""}`} value={b} onChange={(e) => setB(e.target.value.replace(/[^0-9.,-]/g, ""))} />
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
          <p>{TEXTE_AIDE_RESOLUTION_B_1}</p>
        </div>
      )}
    </div>
  );
}
