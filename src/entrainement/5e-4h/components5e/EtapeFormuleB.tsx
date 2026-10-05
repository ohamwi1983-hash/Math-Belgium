import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioB } from "../core5e/problemesContexte.types";
import { diagnostiquerFormuleB } from "../moteur5e/verificationProblemesContexte";
import { CONSIGNE_FORMULE_B, texteAideFormuleB1, latexFormuleFB, formatTermesEtatActuelB } from "../ui5e/formatProblemesContexte";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
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
}

function EtatActuelB({ exercice, aRetenu, bRetenu }: { exercice: ExerciceScenarioB; aRetenu: number; bRetenu: number }) {
  const termes = formatTermesEtatActuelB(exercice, "formule", aRetenu, bRetenu);
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Jamais de placeholder construit à partir de a/b RETENUS — reviendrait à afficher la réponse
 * attendue en clair dans le champ. */
export function EtapeFormuleB({ exercice, donnees, aRetenu, bRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
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
      <EtatActuelB exercice={exercice} aRetenu={aRetenu} bRetenu={bRetenu} />
      <p className="prompt-text">{CONSIGNE_FORMULE_B}</p>
      <ApercuExpressionLatex texte={texte} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">f(x) =</label>
        <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 3*x+7" />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideFormuleB1()}</p>
          <Katex expression={latexFormuleFB(exercice.modele)} block />
        </div>
      )}
    </div>
  );
}
