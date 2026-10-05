import type { ExerciceInequation } from "../core/inequation.types";
import type { ResultatExerciceInequation } from "../moteur/sessionInequation";
import { formatScore } from "../ui/formatScore";
import { formatSolutionEnsemble } from "../ui/formatSolutionEnsemble";

interface Props {
  resultat: ResultatExerciceInequation;
  exercice: ExerciceInequation;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function classeScore(score: number): string {
  return score === 100 ? "score-value is-good" : "score-value is-bad";
}

export function ResultatPanelInequation({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const uneEtapeRevelee = resultat.racinesRevele || resultat.signeARevele || resultat.intervalleRevele;

  return (
    <div>
      <h2 className="result-title">Tableau de signes d'un trinôme du second degré</h2>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une étape a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      <ul className="score-list">
        {resultat.scoreSimplification !== null && (
          <li className="score-item">
            <span>Simplification</span>
            <span className={classeScore(resultat.scoreSimplification)}>{formatScore(resultat.scoreSimplification)}/100</span>
          </li>
        )}
        <li className="score-item">
          <span>Zéros</span>
          <span className={classeScore(resultat.scoreRacines)}>{formatScore(resultat.scoreRacines)}/100</span>
        </li>
        <li className="score-item">
          <span>Signe de a</span>
          <span className={classeScore(resultat.scoreSigneA)}>{formatScore(resultat.scoreSigneA)}/100</span>
        </li>
        <li className="score-item">
          <span>Ensemble-solution</span>
          <span className={classeScore(resultat.scoreIntervalle)}>{formatScore(resultat.scoreIntervalle)}/100</span>
        </li>
      </ul>
      {afficherReponseApresEchec && resultat.scoreRacines === 0 && (
        <p className="answer-reveal">
          Zéros attendus : {exercice.racines === undefined ? "∅" : exercice.racines.join(" ; ")}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSigneA === 0 && (
        <p className="answer-reveal">Signe de a attendu : {exercice.enonce.a > 0 ? "a > 0" : "a < 0"}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreIntervalle === 0 && (
        <p className="answer-reveal">Réponse attendue : S = {formatSolutionEnsemble(exercice.solution)}</p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
