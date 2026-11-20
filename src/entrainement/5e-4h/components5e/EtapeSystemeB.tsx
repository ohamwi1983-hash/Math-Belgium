import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioB } from "../core5e/problemesContexte.types";
import { diagnostiquerEquation1SystemeB, diagnostiquerEquation2SystemeB, type ReponseSystemeB } from "../moteur5e/verificationProblemesContexte";
import { consigneSystemeB, latexCoutTotalB } from "../ui5e/formatProblemesContexte";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapeSystemeB({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [equation1, setEquation1] = useState("");
  const [equation2, setEquation2] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const complet = equation1.trim() !== "" && equation2.trim() !== "";
  const equation1Erronee = montrerErreurs && equation1.trim() !== "" && diagnostiquerEquation1SystemeB(exercice, equation1) !== "correct";
  const equation2Erronee = montrerErreurs && equation2.trim() !== "" && diagnostiquerEquation2SystemeB(exercice, equation2) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { equation1, equation2 };
    const reponseSoumise = reponse;
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("systeme", exercice, reponseSoumise)) {
      setIllisible(true);
      return;
    }
    setIllisible(false);
    setSoumise(reponseSoumise);
    onValider(reponseSoumise);
  }

  return (
    <div>
      {donnees}
      <p className="prompt-text">{consigneSystemeB()}</p>
      <div className="equation-box">
        <Katex expression={latexCoutTotalB(exercice.modele)} block />
      </div>
      <ApercuExpressionLatex texte={equation1} />
      <div className="field">
        <label className="field-label field-label-minuscule">Équation pour x = {exercice.point1.x} :</label>
        <input type="text" className={`text-input${equation1Erronee ? " is-erronee" : ""}`} value={equation1} onChange={(e) => setEquation1(e.target.value)} placeholder="ex : 12*11=11a+b" />
      </div>
      <ApercuExpressionLatex texte={equation2} />
      <div className="field">
        <label className="field-label field-label-minuscule">Équation pour x = {exercice.point2.x} :</label>
        <input type="text" className={`text-input${equation2Erronee ? " is-erronee" : ""}`} value={equation2} onChange={(e) => setEquation2(e.target.value)} placeholder="ex : 30*12=12a+b" />
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("systeme", exercice, {})}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("systeme")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("systeme", exercice, soumise, {}) : null}
        validation={validation}
      />
    </div>
  );
}
