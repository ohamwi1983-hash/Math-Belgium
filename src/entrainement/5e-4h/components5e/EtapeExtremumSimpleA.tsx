import { useState } from "react";
import type { ReactNode } from "react";
import { diagnostiquerExtremumSimpleA } from "../moteur5e/verificationProblemesContexte";
import { consigneExtremumSimpleA, formatTermesEtatActuelAReduit, texteAideExtremumSimpleA1 } from "../ui5e/formatProblemesContexte";
import type { ExerciceScenarioAReduit } from "../ui5e/scenarioAGraphReduit";
import { Katex } from "../components/Katex";
import { ScenarioAGraphReduit } from "./ScenarioAGraphReduit";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceScenarioAReduit;
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: number) => void;
}

function EtatActuelA({ exercice }: { exercice: ExerciceScenarioAReduit }) {
  const termes = formatTermesEtatActuelAReduit(exercice, "extremumSimple");
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

export function EtapeExtremumSimpleA({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [valeur, setValeur] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const valeurErronee = montrerErreurs && valeur.trim() !== "" && diagnostiquerExtremumSimpleA(exercice, Number(valeur.replace(",", "."))) !== "correct";

  function valider() {
    if (valeur.trim() === "") return;
    onValider(Number(valeur.replace(",", ".")));
  }

  return (
    <div>
      {donnees}
      <EtatActuelA exercice={exercice} />
      <p className="prompt-text">{consigneExtremumSimpleA(exercice)}</p>
      <ScenarioAGraphReduit exercice={exercice} />
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
          <p>{texteAideExtremumSimpleA1(exercice)}</p>
        </div>
      )}
    </div>
  );
}
