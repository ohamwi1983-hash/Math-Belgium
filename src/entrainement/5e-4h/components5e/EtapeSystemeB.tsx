import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioB } from "../core5e/problemesContexte.types";
import { diagnostiquerEquation1SystemeB, diagnostiquerEquation2SystemeB, diagnostiquerSystemeB, type ReponseSystemeB } from "../moteur5e/verificationProblemesContexte";
import { consigneSystemeB, texteAideSystemeB1, latexAideSystemeB2, latexCoutTotalB } from "../ui5e/formatProblemesContexte";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceScenarioB;
  /** Bloc "données" persistant (contexte du scénario B) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données → question, jamais l'inverse). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSystemeB) => void;
}

export function EtapeSystemeB({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [equation1, setEquation1] = useState("");
  const [equation2, setEquation2] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = equation1.trim() !== "" && equation2.trim() !== "";
  const equation1Erronee = montrerErreurs && equation1.trim() !== "" && diagnostiquerEquation1SystemeB(exercice, equation1) !== "correct";
  const equation2Erronee = montrerErreurs && equation2.trim() !== "" && diagnostiquerEquation2SystemeB(exercice, equation2) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { equation1, equation2 };
    setDernierStatut(diagnostiquerSystemeB(exercice, reponse));
    onValider(reponse);
  }

  return (
    <div>
      <div className="equation-box">
        <Katex expression={latexCoutTotalB(exercice.modele)} block />
      </div>
      {donnees}
      <p className="prompt-text">{consigneSystemeB()}</p>
      <ApercuExpressionLatex texte={equation1} />
      <div className="field">
        <label className="field-label">Équation pour x={exercice.point1.x} :</label>
        <input type="text" className={`text-input${equation1Erronee ? " is-erronee" : ""}`} value={equation1} onChange={(e) => setEquation1(e.target.value)} placeholder="ex : 25=a*1+b" />
      </div>
      <ApercuExpressionLatex texte={equation2} />
      <div className="field">
        <label className="field-label">Équation pour x={exercice.point2.x} :</label>
        <input type="text" className={`text-input${equation2Erronee ? " is-erronee" : ""}`} value={equation2} onChange={(e) => setEquation2(e.target.value)} placeholder="ex : 56=a*7+b" />
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
          <p>{texteAideSystemeB1()}</p>
          <Katex expression={latexCoutTotalB(exercice.modele)} block />
          {niveauAide >= 2 && <Katex expression={latexAideSystemeB2(exercice)} block />}
        </div>
      )}
    </div>
  );
}
