import type { ResultatExerciceQuizNombresComplexes } from "../moteur6e/typesQuizNombresComplexes";
import { RenduFragments } from "../components/RenduFragments";

interface Props {
  resultat: ResultatExerciceQuizNombresComplexes;
  labelBouton: string;
  onContinuer: () => void;
}

function classeScore(score: number): string {
  return score === 100 ? "score-value is-good" : "score-value is-bad";
}

function libelleVraiFaux(reponse: boolean): string {
  return reponse ? "Vrai" : "Faux";
}

/** Mono-écran, une seule note (comme 6gen64/6gen65/6gen66/6gen67). La justification s'affiche
 * TOUJOURS — même en cas de bonne réponse, jamais seulement `afficherReponseApresEchec && score
 * === 0` — puisqu'il s'agit d'un quiz de révision où le renforcement pédagogique compte autant
 * après une réussite qu'après un échec. Titre "Bonne réponse !"/"Mauvaise réponse", jamais
 * "Vrai !"/"Faux !" : ces mots désignent déjà la valeur de vérité de l'AFFIRMATION, les réutiliser
 * pour qualifier la performance de l'élève créerait une collision de sens (même choix que
 * 6gen64/6gen65/6gen66/6gen67). Énoncé/justification rendus via `RenduFragments` (texte/LaTeX
 * mêlés). */
export function ResultatPanelQuizNombresComplexes({ resultat, labelBouton, onContinuer }: Props) {
  const correct = resultat.score === 100;

  return (
    <div>
      <h2 className="result-title">{correct ? "Bonne réponse !" : "Mauvaise réponse"}</h2>
      <p className="result-subtitle">
        <RenduFragments fragments={resultat.question.enonce} />
      </p>
      <ul className="score-list">
        <li className="score-item">
          <span>Ta réponse</span>
          <span>{libelleVraiFaux(resultat.reponseChoisie)}</span>
        </li>
        <li className="score-item">
          <span>Réponse correcte</span>
          <span>{libelleVraiFaux(resultat.question.reponse)}</span>
        </li>
        <li className="score-item">
          <span>Score</span>
          <span className={classeScore(resultat.score)}>{resultat.score}/100</span>
        </li>
      </ul>
      <div className="triangle-quelconque-aide">
        <RenduFragments fragments={resultat.question.justification} />
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
