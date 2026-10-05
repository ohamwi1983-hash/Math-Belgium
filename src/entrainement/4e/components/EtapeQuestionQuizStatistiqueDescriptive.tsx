import { useState } from "react";
import type { QuestionVraiFaux } from "../core/quizStatistiqueDescriptive.types";

interface Props {
  question: QuestionVraiFaux;
  onValider: (reponse: boolean) => void;
}

/** Écran unique du quiz — un choix Vrai/Faux, sans aide ni second essai (une seule tentative,
 * voir `moteur/sessionQuizStatistiqueDescriptive.ts`) : contrairement aux autres générateurs du
 * projet, il n'y a donc jamais de retour visuel `.is-erronee` avant validation, puisque la
 * question se clôt dès le premier clic sur « Valider ». */
export function EtapeQuestionQuizStatistiqueDescriptive({ question, onValider }: Props) {
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
