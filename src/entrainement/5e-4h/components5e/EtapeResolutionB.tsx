import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioB } from "../core5e/problemesContexte.types";
import { diagnostiquerAResolutionB, diagnostiquerBResolutionB, type ReponseResolutionB } from "../moteur5e/verificationProblemesContexte";
import { CONSIGNE_RESOLUTION_B } from "../ui5e/formatProblemesContexte";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { TexteRiche5e } from "./TexteRiche5e";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, lireNombre5e, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapeResolutionB({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const complet = a.trim() !== "" && b.trim() !== "";
  const aErronee = montrerErreurs && a.trim() !== "" && diagnostiquerAResolutionB(exercice, lireNombre5e(a)) !== "correct";
  const bErronee = montrerErreurs && b.trim() !== "" && diagnostiquerBResolutionB(exercice, lireNombre5e(b)) !== "correct";

  function valider() {
    if (!complet) return;
    const reponseSoumise = { a: lireNombre5e(a), b: lireNombre5e(b) };
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("resolution", exercice, reponseSoumise)) {
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
      <p className="prompt-text"><TexteRiche5e texte={CONSIGNE_RESOLUTION_B} /></p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">a =</label>
          <input type="text" className={`text-input${aErronee ? " is-erronee" : ""}`} value={a} onChange={(e) => setA(normaliserSigneMoins(e.target.value))} />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">b =</label>
          <input type="text" className={`text-input${bErronee ? " is-erronee" : ""}`} value={b} onChange={(e) => setB(normaliserSigneMoins(e.target.value))} />
        </div>
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("resolution", exercice, {})}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("resolution")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("resolution", exercice, soumise, {}) : null}
        validation={validation}
      />
    </div>
  );
}
