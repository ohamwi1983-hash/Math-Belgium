import { useState } from "react";
import type { ChoixAllure, ExerciceAnalyseFonction, SigneAllure, SigneProduitAB } from "../core/analyseFonction.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { calculerAllureSketch } from "../ui/allureSketch";
import { AllureSketch } from "./AllureSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { Katex } from "./Katex";
import { AidesNiveaux } from "./RetourSaisie";
import type { FragmentConsigne } from "../ui/formatEquationDroite";

interface Props {
  exercice: ExerciceAnalyseFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (reponse: ChoixAllure) => void;
  /** Aides à deux niveaux (KaTeX). */
  aides?: FragmentConsigne[][];
  onActiverAide?: () => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Étape 2 : signe de a et signe de a·b, croquis (Oy seul) mis à jour en direct. */
export function EtapeAllure({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onValider, aides, onActiverAide, validation }: Props) {
  const [signeA, setSigneA] = useState<SigneAllure | null>(null);
  const [signeAB, setSigneAB] = useState<SigneProduitAB | null>(null);

  const croquis = calculerAllureSketch(signeA, signeAB, exercice.exercice.enonce.c);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {/* `prompt-text--question-multiple` : deux questions de poids égal sur cet écran — la règle
       * générique (`.prompt-text:not(:has(~ .prompt-text))` dans theme.css) ne met en avant que la
       * DERNIÈRE question d'un écran (cas "consigne générale puis question spécifique"), ce qui
       * laissait "signe de a ?" sans accent comme si ce n'était qu'un rappel de contexte. */}
      <p className="prompt-text prompt-text--question-multiple">Quel est le signe de a ?</p>
      <div className="options-grid-compact">
        <button type="button" className={signeA === "+" ? "btn toggle-active" : "btn"} onClick={() => setSigneA("+")}>
          <Katex expression="a>0" />
        </button>
        <button type="button" className={signeA === "-" ? "btn toggle-active" : "btn"} onClick={() => setSigneA("-")}>
          <Katex expression="a<0" />
        </button>
      </div>
      <p className="prompt-text prompt-text--question-multiple">
        Quel est le signe de <Katex expression="a\cdot b" /> ?
      </p>
      <div className="options-grid-compact">
        <button type="button" className={signeAB === "+" ? "btn toggle-active" : "btn"} onClick={() => setSigneAB("+")}>
          <Katex expression="a\cdot b>0" />
        </button>
        <button type="button" className={signeAB === "-" ? "btn toggle-active" : "btn"} onClick={() => setSigneAB("-")}>
          <Katex expression="a\cdot b<0" />
        </button>
        <button type="button" className={signeAB === "0" ? "btn toggle-active" : "btn"} onClick={() => setSigneAB("0")}>
          <Katex expression="a\cdot b=0" />
        </button>
      </div>

      <AllureSketch croquis={croquis} />

      {!validation && (
        <>
        {aides && <AidesNiveaux aides={aides} onPremiereAide={onActiverAide} />}
        <button
          type="button"
          className="btn btn-primary"
          disabled={signeA === null || signeAB === null}
          onClick={() => signeA !== null && signeAB !== null && onValider({ signeA, signeAB })}
        >
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
