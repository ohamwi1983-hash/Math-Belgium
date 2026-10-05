import { useState } from "react";
import type { QuestionVraiFaux5e } from "../core5e/quizDerivees5e.types";

interface Props {
  question: QuestionVraiFaux5e;
  onValider: (reponse: boolean) => void;
}

/** Écran unique du quiz — un choix Vrai/Faux, sans aide ni second essai (une seule tentative, voir
 * `moteur5e/sessionQuizDerivees5e.ts`). Structure mécaniquement identique à
 * `EtapeQuestionQuizLimites5e.tsx` (chapitre 4, 5gen42), `EtapeQuestionQuizSuites5e.tsx` (chapitre
 * 3, 5gen41), `EtapeQuestionQuizTrigonometrie5e.tsx` (chapitre 2, 5gen40) et à
 * `EtapeQuestionQuizFonctions5e.tsx` (chapitre 1, 5gen39). */
export function EtapeQuestionQuizDerivees5e({ question, onValider }: Props) {
  const [choix, setChoix] = useState<boolean | null>(null);

  return (
    <div>
      <p className="prompt-text">{question.enonce}</p>

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
