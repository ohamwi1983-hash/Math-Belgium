import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioB } from "../core5e/problemesContexte.types";
import { diagnostiquerFormuleB } from "../moteur5e/verificationProblemesContexte";
import { CONSIGNE_FORMULE_B, texteAideFormuleB1, latexFormuleFB } from "../ui5e/formatProblemesContexte";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceScenarioB;
  /** Bloc "données" persistant (contexte du scénario B) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données -> question, jamais l'inverse). */
  donnees: ReactNode;
  /** Continuité — a/b RETENUS (voir `moteur5e/sessionProblemesContexte.ts`), affichés dans le bloc
   * "état actuel" seulement (jamais dans un placeholder du champ, voir plus bas). */
  aRetenu: number;
  bRetenu: number;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Jamais de placeholder construit à partir de a/b RETENUS — reviendrait à afficher la réponse
 * attendue en clair dans le champ. */
export function EtapeFormuleB({ exercice, donnees, aRetenu, bRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = montrerErreurs && texte.trim() !== "" && diagnostiquerFormuleB(texte, exercice.modele, aRetenu, bRetenu) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    setDernierStatut(diagnostiquerFormuleB(texte, exercice.modele, aRetenu, bRetenu));
    onValider(texte);
  }

  return (
    <div>
      {donnees}
      <p className="prompt-text">{CONSIGNE_FORMULE_B}</p>
      <ApercuExpressionLatex texte={texte} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">f(x) =</label>
        <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 3*x+7" />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideFormuleB1()}</p>
          <Katex expression={latexFormuleFB(exercice.modele)} block />
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
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
    </div>
  );
}
