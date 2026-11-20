import { useState } from "react";
import type { ReactNode } from "react";
import { diagnostiquerFGeneralisationSimpleA, diagnostiquerGGeneralisationSimpleA } from "../moteur5e/verificationProblemesContexte";
import type { ReponseGeneralisationSimpleA } from "../moteur5e/verificationProblemesContexte";
import { consigneGeneralisationSimpleA } from "../ui5e/formatProblemesContexte";
import type { ExerciceScenarioAReduit } from "../ui5e/scenarioAGraphReduit";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { TexteRiche5e } from "./TexteRiche5e";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

interface Props {
  exercice: ExerciceScenarioAReduit;
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseGeneralisationSimpleA) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapeGeneralisationSimpleA({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [f, setF] = useState("");
  const [g, setG] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const complet = f.trim() !== "" && g.trim() !== "";
  const fErronee = montrerErreurs && f.trim() !== "" && diagnostiquerFGeneralisationSimpleA(exercice, f) !== "correct";
  const gErronee = montrerErreurs && g.trim() !== "" && diagnostiquerGGeneralisationSimpleA(exercice, g) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { f, g };
    const reponseSoumise = reponse;
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("generalisationSimple", exercice, reponseSoumise)) {
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
      <p className="prompt-text"><TexteRiche5e texte={consigneGeneralisationSimpleA(exercice)} /></p>
      <ApercuExpressionLatex texte={f} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">f(x) =</label>
        <input type="text" className={`text-input${fErronee ? " is-erronee" : ""}`} value={f} onChange={(e) => setF(e.target.value)} placeholder="ex : 9*x+30" />
      </div>
      <ApercuExpressionLatex texte={g} label="g(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">g(x) =</label>
        <input type="text" className={`text-input${gErronee ? " is-erronee" : ""}`} value={g} onChange={(e) => setG(e.target.value)} placeholder="ex : 1500/x" />
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("generalisationSimple", exercice, {})}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("generalisationSimple")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("generalisationSimple", exercice, soumise, {}) : null}
        validation={validation}
      />
    </div>
  );
}
