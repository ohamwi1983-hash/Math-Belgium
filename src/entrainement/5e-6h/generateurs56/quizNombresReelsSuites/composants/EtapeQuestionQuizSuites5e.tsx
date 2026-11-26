// Copie 5e (6h) de `5e-4h/components5e/EtapeQuestionQuizSuites5e.tsx` (56gen13 ← 5gen41, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { QuestionVraiFaux5e } from "../core/quizSuites5e.types";
import { TexteRiche5e } from "../../../../5e-4h/components5e/TexteRiche5e";

interface Props {
  question: QuestionVraiFaux5e;
  onValider: (reponse: boolean) => void;
}

/** Écran unique du quiz — un choix Vrai/Faux, sans aide ni second essai (une seule tentative, voir
 * `moteur5e/sessionQuizSuites5e.ts`). Structure mécaniquement identique à
 * `EtapeQuestionQuizTrigonometrie5e.tsx` (chapitre 2, 5gen40) et à
 * `EtapeQuestionQuizFonctions5e.tsx` (chapitre 1, 5gen39). */
export function EtapeQuestionQuizSuites5e({ question, onValider }: Props) {
  const [choix, setChoix] = useState<boolean | null>(null);

  return (
    <div>
      <p className="prompt-text">
        <TexteRiche5e texte={question.enonce} />
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
