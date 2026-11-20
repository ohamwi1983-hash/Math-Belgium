import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { CONSIGNE_GENERALE } from "../ui6e/formatEquationsCyclometriques";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesCyclo, MESSAGES_ILLISIBLE_CYCLO, MessageRetourCyclo, lisibleEquationCyclo, useRetourCyclo } from "./RetourSaisieCyclo";
import type { AideCyclo } from "./RetourSaisieCyclo";

interface Props {
  consigneEcran: string;
  equationLatex: string;
  aideNiveau1: AideCyclo;
  aideNiveau2: AideCyclo;
  placeholder: string;
  /** Message ciblé sur la dernière équation fausse (null : générique). */
  cible?: (texte: string) => FragmentConsigne[] | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran « équation sans arcfonction » de `6gen3` (champ libre, trois tentatives). Règles communes
 * du 6e ch. 1 (lot B) : une équation illisible (pas de signe =, parenthèse manquante…) n'est jamais
 * transmise (aucune tentative, message) ; π, √, « − » lus ; message ciblé ; aides KaTeX.
 */
export function EtapeChampEquationCyclo({
  consigneEcran,
  equationLatex,
  aideNiveau1,
  aideNiveau2,
  placeholder,
  cible,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [texte, setTexte] = useState("");
  const retour = useRetourCyclo<string>();
  const derniere = retour.soumise;
  const fausse = tentativesUtilisees > 0 && derniere === texte;

  function valider() {
    if (texte.trim() === "") return;
    retour.tenter(texte, lisibleEquationCyclo(texte) ? null : MESSAGES_ILLISIBLE_CYCLO.equation, onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={equationLatex} />
          </div>
        }
      />
      <p className="prompt-text">{consigneEcran}</p>
      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <input type="text" className={`text-input${fausse ? " is-erronee" : ""}`} value={texte} placeholder={placeholder} disabled={!!validation} onChange={(e) => setTexte(e.target.value)} />
      </div>
      <AidesCyclo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
            Valider
          </button>
          <MessageRetourCyclo blocage={retour.blocage} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={derniere !== null && cible ? cible(derniere) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
