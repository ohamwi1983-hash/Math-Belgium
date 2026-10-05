import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioAConteneur } from "../core5e/problemesContexte.types";
import { CONSIGNE_EGALITE_AIRES_A, TEXTE_AIDE_EGALITE_AIRES_A_1, formatTermesEtatActuelA, latexAideEgaliteAiresA2 } from "../ui5e/formatProblemesContexte";
import { diagnostiquerEgaliteAiresA } from "../moteur5e/verificationProblemesContexte";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceScenarioAConteneur;
  /** Bloc "données" persistant (contexte du scénario A) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données -> question, jamais l'inverse). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: number) => void;
}

function EtatActuelA({ exercice }: { exercice: ExerciceScenarioAConteneur }) {
  const termes = formatTermesEtatActuelA(exercice, "egaliteAires", null);
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

export function EtapeEgaliteAiresA({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [valeur, setValeur] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const valeurErronee = montrerErreurs && valeur.trim() !== "" && diagnostiquerEgaliteAiresA(exercice, Number(valeur.replace(",", "."))) !== "correct";

  function valider() {
    if (valeur.trim() === "") return;
    onValider(Number(valeur.replace(",", ".")));
  }

  return (
    <div>
      {donnees}
      <EtatActuelA exercice={exercice} />
      <p className="prompt-text">{CONSIGNE_EGALITE_AIRES_A}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">x =</label>
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
          <p>{TEXTE_AIDE_EGALITE_AIRES_A_1}</p>
          {niveauAide >= 2 && <Katex expression={latexAideEgaliteAiresA2(exercice)} block />}
        </div>
      )}
    </div>
  );
}
