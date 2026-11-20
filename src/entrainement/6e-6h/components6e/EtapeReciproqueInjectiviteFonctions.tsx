import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { CoteBranche } from "../moteur6e/typesInjectiviteFonctions";
import { diagnostiquerReciproque } from "../moteur6e/verificationInjectiviteFonctions";
import { CONSIGNE_ECRAN_RECIPROQUE, CONSIGNE_GENERALE, formatFLatexAffichage } from "../ui6e/formatInjectiviteFonctions";
import { AIDE_RECIPROQUE_1, aideReciproque2, cibleReciproque } from "../ui6e/aidesInjectiviteFonctions";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesCyclo, MESSAGES_ILLISIBLE_CYCLO, MessageRetourCyclo, useRetourCyclo } from "./RetourSaisieCyclo";

interface Props {
  exercice: ExerciceInjectiviteFonctions;
  /** Branche mémorisée par la Couche B à la clôture de l'écran précédent. */
  coteChoisi: CoteBranche;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** « f⁻¹(x) = », « y = » recopiés au début de la saisie : tolérés. */
export function sansPrefixeReciproque(texte: string): string {
  return texte.replace(/^\s*(f\s*(⁻¹|\^\s*\(?\s*[-−–—]\s*1\s*\)?)\s*\(\s*x\s*\)|y)\s*=\s*/i, "");
}

/** Écran 3 de `6gen1` — champ libre « f⁻¹(x) = » (trois tentatives) ; saisie illisible : message
 * sans tentative ; messages ciblés (inverse 1/f, f recopiée, autre moitié). */
export function EtapeReciproqueInjectiviteFonctions({ exercice, coteChoisi, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const retour = useRetourCyclo<string>();
  const derniere = retour.soumise;
  const fausse = tentativesUtilisees > 0 && derniere !== null && derniere === sansPrefixeReciproque(texte);

  function valider() {
    if (texte.trim() === "") return;
    const t = sansPrefixeReciproque(texte);
    retour.tenter(t, diagnostiquerReciproque(exercice, coteChoisi, t) === "parse_error" ? MESSAGES_ILLISIBLE_CYCLO.expressionX : null, (v) => {
      onValider(v);
    });
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={CONSIGNE_GENERALE} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatFLatexAffichage(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={CONSIGNE_ECRAN_RECIPROQUE} />
      </p>

      <ApercuExpressionLatex texte={texte} label="f⁻¹(x) =" />
      <div className="field champ-reponse-latex">
        <span className="field-label-latex">
          <Katex expression="f^{-1}(x) =" />
        </span>
        <input type="text" className={`text-input${fausse ? " is-erronee" : ""}`} value={texte} disabled={!!validation} placeholder="expression en x" onChange={(e) => setTexte(e.target.value)} />
      </div>

      <AidesCyclo aide1={AIDE_RECIPROQUE_1} aide2={aideReciproque2(exercice)} niveauAide={niveauAide} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
            Valider
          </button>
          <MessageRetourCyclo blocage={retour.blocage} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={derniere !== null ? cibleReciproque(exercice, coteChoisi, derniere) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
