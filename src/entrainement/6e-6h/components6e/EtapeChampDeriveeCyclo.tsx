import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { CONSIGNE_GENERALE } from "../ui6e/formatDeriveesCyclometriques";
import type { FragmentConsigne } from "../ui6e/formatDeriveesCyclometriques";
import type { StatutVerification } from "../moteur/statutVerification";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesCyclo, MESSAGES_ILLISIBLE_CYCLO, MessageRetourCyclo, lisibleExpressionCyclo, useRetourCyclo } from "./RetourSaisieCyclo";
import type { AideCyclo } from "./RetourSaisieCyclo";

interface Props {
  consigneEcran: FragmentConsigne[];
  fonctionLatex: string;
  aideNiveau1: AideCyclo;
  aideNiveau2: AideCyclo;
  placeholder: string;
  /** Diagnostic de l'écran (mêmes fonctions que le moteur) : `parse_error` = illisible, rien n'est
   * transmis (aucune tentative). Absent : seule la syntaxe est contrôlée. */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Message ciblé sur la dernière réponse fausse (null : générique). */
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
 * Écran générique « dérivée » de `6gen4` (un champ libre, trois tentatives). Règles communes du 6e
 * ch. 1 (lot B) : saisie illisible signalée sans tentative ; π, √, « − », « · » lus ; message ciblé
 * (signe de arccos, u′ oublié, carré de l'argument) ; aides KaTeX à deux niveaux.
 */
export function EtapeChampDeriveeCyclo({
  consigneEcran,
  fonctionLatex,
  aideNiveau1,
  aideNiveau2,
  placeholder,
  diagnostiquer,
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
    const illisible = diagnostiquer ? diagnostiquer(texte) === "parse_error" : !lisibleExpressionCyclo(texte);
    retour.tenter(texte, illisible ? MESSAGES_ILLISIBLE_CYCLO.expressionX : null, onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={fonctionLatex} />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
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
