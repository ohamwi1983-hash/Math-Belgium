import { useState } from "react";
import type { QuestionVraiFaux } from "../core/quizCercleTriangles.types";

interface Props {
  question: QuestionVraiFaux;
  onValider: (reponse: boolean) => void;
}

/** Écran unique du quiz — un choix Vrai/Faux, sans aide ni second essai (une seule tentative, voir
 * `moteur/sessionQuizCercleTriangles.ts`). Structure identique à
 * `EtapeQuestionQuizFonctionsReference.tsx` (gen62) et aux 3 quiz précédents. */
export function EtapeQuestionQuizCercleTriangles({ question, onValider }: Props) {
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
