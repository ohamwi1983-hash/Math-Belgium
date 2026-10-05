import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import { CONSIGNE_SEUIL_C, TEXTE_AIDE_SEUIL_C_1, formatTermesEtatActuelC } from "../ui5e/formatProblemesContexte";
import { diagnostiquerSeuilC } from "../moteur5e/verificationProblemesContexte";
import { Katex } from "../components/Katex";
import { ScenarioCGraph } from "./ScenarioCGraph";
import { BoutonAide } from "./BoutonAide";

function EtatActuelC({ exercice }: { exercice: ExerciceScenarioC }) {
  const termes = formatTermesEtatActuelC(exercice, "seuil");
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

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
  onValider: (reponse: number) => void;
}

export function EtapeSeuilC({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [valeur, setValeur] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const valeurErronee = montrerErreurs && valeur.trim() !== "" && diagnostiquerSeuilC(exercice, Number(valeur.replace(",", "."))) !== "correct";

  function valider() {
    if (valeur.trim() === "") return;
    onValider(Number(valeur.replace(",", ".")));
  }

  return (
    <div>
      {donnees}
      <EtatActuelC exercice={exercice} />
      <p className="prompt-text">{CONSIGNE_SEUIL_C}</p>
      <ScenarioCGraph exercice={exercice} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">x ≈</label>
        <input
          type="text"
          className={`text-input${valeurErronee ? " is-erronee" : ""}`}
          value={valeur}
          onChange={(e) => setValeur(e.target.value.replace(/[^0-9.,-]/g, ""))}
        />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={valeur.trim() === ""} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_SEUIL_C_1}</p>
        </div>
      )}
    </div>
  );
}
