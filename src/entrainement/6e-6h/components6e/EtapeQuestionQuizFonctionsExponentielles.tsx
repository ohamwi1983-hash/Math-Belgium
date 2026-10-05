import { useState } from "react";
import type { QuestionVraiFaux } from "../core6e/quizFonctionsExponentielles.types";
import { RenduFragments } from "../components/RenduFragments";

interface Props {
  question: QuestionVraiFaux;
  onValider: (reponse: boolean) => void;
}

/** Écran unique du quiz — un choix Vrai/Faux, sans aide ni second essai (une seule tentative, voir
 * `moteur6e/sessionQuizFonctionsExponentielles.ts`). Structure identique à 6gen64 et aux 4 quiz
 * vrai/faux du chantier 4e (gen59-62). Énoncé rendu via `RenduFragments` (texte/LaTeX mêlés,
 * seule différence réelle avec 6gen64 — voir `core6e/quizFonctionsExponentielles.types.ts`). */
export function EtapeQuestionQuizFonctionsExponentielles({ question, onValider }: Props) {
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
