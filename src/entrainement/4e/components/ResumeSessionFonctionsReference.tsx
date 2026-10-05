import type { ResultatExerciceFonctionReference } from "../moteur/typesFonctionsReference";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceFonctionReference[];
  onRecommencer: () => void;
}

function moyenneExercice(resultat: ResultatExerciceFonctionReference): number {
  return (resultat.scoreReconnaissance + resultat.scoreEquation + resultat.scoreCurseurs) / 3;
}

export function ResumeSessionFonctionsReference({ resultats, onRecommencer }: Props) {
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
            <th>Famille</th>
            <th>Équation</th>
            <th>Curseurs</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{formatScore(resultat.scoreReconnaissance)}</td>
              <td>{formatScore(resultat.scoreEquation)}</td>
              <td>{formatScore(resultat.scoreCurseurs)}</td>
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
