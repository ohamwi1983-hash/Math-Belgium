import type { ResultatExerciceValeursRemarquables } from "../moteur/typesValeursRemarquables";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceValeursRemarquables[];
  onRecommencer: () => void;
}

function moyenneExercice(resultat: ResultatExerciceValeursRemarquables): number {
  return (resultat.scoreQuadrant + resultat.scoreAnglePremierQuadrant + resultat.scoreValeursExactes) / 3;
}

export function ResumeSessionValeursRemarquables({ resultats, onRecommencer }: Props) {
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
            <th>Angle</th>
            <th>Quadrant</th>
            <th>1er quadrant</th>
            <th>Valeurs exactes</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{resultat.anglePremierQuadrant}°</td>
              <td>{formatScore(resultat.scoreQuadrant)}</td>
              <td>{formatScore(resultat.scoreAnglePremierQuadrant)}</td>
              <td>{formatScore(resultat.scoreValeursExactes)}</td>
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
