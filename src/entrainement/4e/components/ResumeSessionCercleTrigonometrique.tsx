import type { ResultatExerciceCercleTrigonometrique } from "../moteur/typesCercleTrigonometrique";
import { libelleVariante } from "../ui/formatCercleTrigonometrique";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceCercleTrigonometrique[];
  onRecommencer: () => void;
}

/** Moyenne des 4 notes — scoreReduction filtré s'il est null (étape sautée), jamais compté comme 0. */
function moyenneExercice(resultat: ResultatExerciceCercleTrigonometrique): number {
  const scores = [resultat.scoreReduction, resultat.scoreQuadrant, resultat.scoreAnglePremierQuadrant, resultat.scoreSignes].filter(
    (score): score is number => score !== null,
  );
  return scores.reduce((somme, score) => somme + score, 0) / scores.length;
}

export function ResumeSessionCercleTrigonometrique({ resultats, onRecommencer }: Props) {
  const moyenne = resultats.reduce((somme, r) => somme + moyenneExercice(r), 0) / resultats.length;

  return (
    <div>
      <h2 className="result-title">Session terminée</h2>
      <p className="result-subtitle">{resultats.length} exercices complétés</p>
      <div className="score-hero">
        <div className="score-hero-value">{moyenne.toFixed(0)}/100</div>
        <div className="score-hero-label">score moyen</div>
      </div>
      <table className="summary-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Variante</th>
            <th>Réduction</th>
            <th>Quadrant</th>
            <th>1er quadrant</th>
            <th>Signes</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleVariante(resultat.variante)}</td>
              <td>{resultat.scoreReduction === null ? "—" : formatScore(resultat.scoreReduction)}</td>
              <td>{formatScore(resultat.scoreQuadrant)}</td>
              <td>{formatScore(resultat.scoreAnglePremierQuadrant)}</td>
              <td>{formatScore(resultat.scoreSignes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn btn-primary" onClick={onRecommencer}>
        Recommencer
      </button>
    </div>
  );
}
