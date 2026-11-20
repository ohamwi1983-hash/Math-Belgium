import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioAConteneur } from "../core5e/problemesContexte.types";
import {
  diagnostiquerFGeneralisationA,
  diagnostiquerGGeneralisationA,
  diagnostiquerHGeneralisationA,
  type ReponseGeneralisationA,
} from "../moteur5e/verificationProblemesContexte";
import {
  CONSIGNE_GENERALISATION_A,
} from "../ui5e/formatProblemesContexte";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { TexteRiche5e } from "./TexteRiche5e";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

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
  onValider: (reponse: ReponseGeneralisationA) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapeGeneralisationA({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [h, setH] = useState("");
  const [f, setF] = useState("");
  const [g, setG] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const complet = h.trim() !== "" && f.trim() !== "" && g.trim() !== "";
  const hErronee = montrerErreurs && h.trim() !== "" && diagnostiquerHGeneralisationA(exercice, h) !== "correct";
  const fErronee = montrerErreurs && f.trim() !== "" && diagnostiquerFGeneralisationA(exercice, f) !== "correct";
  const gErronee = montrerErreurs && g.trim() !== "" && diagnostiquerGGeneralisationA(exercice, g) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { h, f, g };
    const reponseSoumise = reponse;
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("generalisation", exercice, reponseSoumise)) {
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
      <p className="prompt-text"><TexteRiche5e texte={CONSIGNE_GENERALISATION_A} /></p>
      <ApercuExpressionLatex texte={h} label="h(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">h(x) =</label>
        <input type="text" className={`text-input${hErronee ? " is-erronee" : ""}`} value={h} onChange={(e) => setH(e.target.value)} placeholder="ex : V/(2*pi*x)" />
      </div>
      <ApercuExpressionLatex texte={f} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">f(x) =</label>
        <input type="text" className={`text-input${fErronee ? " is-erronee" : ""}`} value={f} onChange={(e) => setF(e.target.value)} placeholder="ex : 3*V/x^2" />
      </div>
      <ApercuExpressionLatex texte={g} label="g(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">g(x) =</label>
        <input type="text" className={`text-input${gErronee ? " is-erronee" : ""}`} value={g} onChange={(e) => setG(e.target.value)} placeholder="ex : 4*pi*x" />
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("generalisation", exercice, {})}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("generalisation")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("generalisation", exercice, soumise, {}) : null}
        validation={validation}
      />
    </div>
  );
}
