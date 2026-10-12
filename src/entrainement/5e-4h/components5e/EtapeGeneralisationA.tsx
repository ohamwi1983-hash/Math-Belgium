import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioAConteneur } from "../core5e/problemesContexte.types";
import {
  diagnostiquerFGeneralisationA,
  diagnostiquerGGeneralisationA,
  diagnostiquerGeneralisationA,
  diagnostiquerHGeneralisationA,
  type ReponseGeneralisationA,
} from "../moteur5e/verificationProblemesContexte";
import {
  CONSIGNE_GENERALISATION_A,
  TEXTE_AIDE_GENERALISATION_A_1,
  latexAideGeneralisationA2F,
  latexAideGeneralisationA2G,
  latexAideGeneralisationA2H,
} from "../ui5e/formatProblemesContexte";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

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
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = h.trim() !== "" && f.trim() !== "" && g.trim() !== "";
  const hErronee = montrerErreurs && h.trim() !== "" && diagnostiquerHGeneralisationA(exercice, h) !== "correct";
  const fErronee = montrerErreurs && f.trim() !== "" && diagnostiquerFGeneralisationA(exercice, f) !== "correct";
  const gErronee = montrerErreurs && g.trim() !== "" && diagnostiquerGGeneralisationA(exercice, g) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { h, f, g };
    setDernierStatut(diagnostiquerGeneralisationA(exercice, reponse));
    onValider(reponse);
  }

  return (
    <div>
      {donnees}
      <p className="prompt-text">{CONSIGNE_GENERALISATION_A}</p>
      <ApercuExpressionLatex texte={h} label="h(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">h(x) =</label>
        <input type="text" className={`text-input${hErronee ? " is-erronee" : ""}`} value={h} onChange={(e) => setH(e.target.value)} placeholder="ex : V/(pi*x^2)" />
      </div>
      <ApercuExpressionLatex texte={f} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">f(x) =</label>
        <input type="text" className={`text-input${fErronee ? " is-erronee" : ""}`} value={f} onChange={(e) => setF(e.target.value)} placeholder="ex : 2*V/x" />
      </div>
      <ApercuExpressionLatex texte={g} label="g(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">g(x) =</label>
        <input type="text" className={`text-input${gErronee ? " is-erronee" : ""}`} value={g} onChange={(e) => setG(e.target.value)} placeholder="ex : 2*pi*x^2" />
      </div>
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_GENERALISATION_A_1}</p>
          {niveauAide >= 2 && (
            <>
              <Katex expression={latexAideGeneralisationA2H()} block />
              <Katex expression={latexAideGeneralisationA2F()} block />
              <Katex expression={latexAideGeneralisationA2G()} block />
            </>
          )}
        </div>
      )}
    </div>
  );
}
