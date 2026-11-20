import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import {
  diagnostiquerCpReconnaissanceC,
  diagnostiquerCvReconnaissanceC,
  type ReponseReconnaissanceC,
} from "../moteur5e/verificationProblemesContexte";
import { CONSIGNE_RECONNAISSANCE_C, consigneContexteC } from "../ui5e/formatProblemesContexte";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ScenarioCGraph } from "./ScenarioCGraph";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteRiche5e } from "./TexteRiche5e";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

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
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const complet = cv.trim() !== "" && cp.trim() !== "";
  const cvErronee = montrerErreurs && cv.trim() !== "" && diagnostiquerCvReconnaissanceC(exercice, cv) !== "correct";
  const cpErronee = montrerErreurs && cp.trim() !== "" && diagnostiquerCpReconnaissanceC(exercice, cp) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { cv, cp };
    const reponseSoumise = reponse;
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("reconnaissance", exercice, reponseSoumise)) {
      setIllisible(true);
      return;
    }
    setIllisible(false);
    setSoumise(reponseSoumise);
    onValider(reponseSoumise);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<TexteRiche5e texte={consigneContexteC(exercice)} />}
        blocDonnees={
          <>
            {donnees}
            <ScenarioCGraph exercice={exercice} courbes="cvCp" />
          </>
        }
      />
      <p className="prompt-text"><TexteRiche5e texte={CONSIGNE_RECONNAISSANCE_C} /></p>
      <ApercuExpressionLatex texte={cv} label="CV(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">CV(x) =</label>
        <input type="text" className={`text-input${cvErronee ? " is-erronee" : ""}`} value={cv} onChange={(e) => setCv(e.target.value)} placeholder="ex : 9*x^4" />
      </div>
      <ApercuExpressionLatex texte={cp} label="CP(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">CP(x) =</label>
        <input type="text" className={`text-input${cpErronee ? " is-erronee" : ""}`} value={cp} onChange={(e) => setCp(e.target.value)} placeholder="ex : 12*x" />
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("reconnaissance", exercice, {})}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("reconnaissance")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("reconnaissance", exercice, soumise, {}) : null}
        validation={validation}
      />
    </div>
  );
}
