import { useState } from "react";
import type { QuestionVraiFaux } from "../core6e/quizProbabilites.types";
import { RenduFragments } from "../components/RenduFragments";

interface Props {
  question: QuestionVraiFaux;
  onValider: (reponse: boolean) => void;
}

/** Écran unique du quiz — un choix Vrai/Faux, sans aide ni second essai (une seule tentative, voir
 * `moteur6e/sessionQuizProbabilites.ts`). Structure identique à 6gen68 et 6gen67/66/65. Énoncé
 * rendu via `RenduFragments` (texte/LaTeX mêlés, seule différence réelle avec 6gen64 — voir
 * `core6e/quizProbabilites.types.ts`). */
export function EtapeQuestionQuizProbabilites({ question, onValider }: Props) {
  const [choix, setChoix] = useState<boolean | null>(null);

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={question.enonce} />
      </p>

      <div className="options-grid-compact">
        <button type="button" className={`btn${choix === true ? " toggle-active" : ""}`} onClick={() => setChoix(true)}>
          Vrai
        </button>
        <button type="button" className={`btn${choix === false ? " toggle-active" : ""}`} onClick={() => setChoix(false)}>
          Faux
        </button>
      </div>

      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
        Valider
      </button>
    </div>
  );
}
