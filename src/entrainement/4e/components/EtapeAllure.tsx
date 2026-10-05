import { useState } from "react";
import type { ChoixAllure, ExerciceAnalyseFonction, SigneAllure, SigneProduitAB } from "../core/analyseFonction.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import { formatFonctionOrdreLatex } from "../ui/formatAnalyseFonction";
import { calculerAllureSketch } from "../ui/allureSketch";
import { AllureSketch } from "./AllureSketch";

interface Props {
  exercice: ExerciceAnalyseFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (reponse: ChoixAllure) => void;
}

/** Étape 2 : signe de a et signe de a·b, croquis (Oy seul) mis à jour en direct. */
export function EtapeAllure({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onValider }: Props) {
  const [signeA, setSigneA] = useState<SigneAllure | null>(null);
  const [signeAB, setSigneAB] = useState<SigneProduitAB | null>(null);

  const croquis = calculerAllureSketch(signeA, signeAB, exercice.exercice.enonce.c);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatFonctionOrdreLatex(exercice.exercice.enonce, exercice.ordreTermes)} block />
      </div>
      <p className="prompt-text">Quel est le signe de a ?</p>
      <div className="options-grid-compact">
        <button type="button" className={signeA === "+" ? "btn toggle-active" : "btn"} onClick={() => setSigneA("+")}>
          a &gt; 0
        </button>
        <button type="button" className={signeA === "-" ? "btn toggle-active" : "btn"} onClick={() => setSigneA("-")}>
          a &lt; 0
        </button>
      </div>
      <p className="prompt-text">Quel est le signe de a·b ?</p>
      <div className="options-grid-compact">
        <button type="button" className={signeAB === "+" ? "btn toggle-active" : "btn"} onClick={() => setSigneAB("+")}>
          a·b &gt; 0
        </button>
        <button type="button" className={signeAB === "-" ? "btn toggle-active" : "btn"} onClick={() => setSigneAB("-")}>
          a·b &lt; 0
        </button>
        <button type="button" className={signeAB === "0" ? "btn toggle-active" : "btn"} onClick={() => setSigneAB("0")}>
          a·b = 0
        </button>
      </div>

      <AllureSketch croquis={croquis} />

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
    </div>
  );
}
