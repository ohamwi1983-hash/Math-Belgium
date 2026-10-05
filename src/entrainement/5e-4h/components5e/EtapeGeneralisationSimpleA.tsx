import { useState } from "react";
import type { ReactNode } from "react";
import { diagnostiquerFGeneralisationSimpleA, diagnostiquerGGeneralisationSimpleA, diagnostiquerGeneralisationSimpleA } from "../moteur5e/verificationProblemesContexte";
import type { ReponseGeneralisationSimpleA } from "../moteur5e/verificationProblemesContexte";
import { consigneGeneralisationSimpleA, texteAideGeneralisationSimpleA1 } from "../ui5e/formatProblemesContexte";
import type { ExerciceScenarioAReduit } from "../ui5e/scenarioAGraphReduit";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceScenarioAReduit;
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseGeneralisationSimpleA) => void;
}

export function EtapeGeneralisationSimpleA({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [f, setF] = useState("");
  const [g, setG] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = f.trim() !== "" && g.trim() !== "";
  const fErronee = montrerErreurs && f.trim() !== "" && diagnostiquerFGeneralisationSimpleA(exercice, f) !== "correct";
  const gErronee = montrerErreurs && g.trim() !== "" && diagnostiquerGGeneralisationSimpleA(exercice, g) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { f, g };
    setDernierStatut(diagnostiquerGeneralisationSimpleA(exercice, reponse));
    onValider(reponse);
  }

  return (
    <div>
      {donnees}
      <p className="prompt-text">{consigneGeneralisationSimpleA(exercice)}</p>
      <ApercuExpressionLatex texte={f} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">f(x) =</label>
        <input type="text" className={`text-input${fErronee ? " is-erronee" : ""}`} value={f} onChange={(e) => setF(e.target.value)} placeholder="ex : 2*x+5" />
      </div>
      <ApercuExpressionLatex texte={g} label="g(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">g(x) =</label>
        <input type="text" className={`text-input${gErronee ? " is-erronee" : ""}`} value={g} onChange={(e) => setG(e.target.value)} placeholder="ex : 10/x" />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideGeneralisationSimpleA1(exercice)}</p>
        </div>
      )}
    </div>
  );
}
