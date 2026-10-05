import type { ResultatExerciceFormeCanoniqueFonctionReference } from "../moteur/typesFormeCanoniqueFonctionsReference";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceFormeCanoniqueFonctionReference[];
  onRecommencer: () => void;
}

function moyenneExercice(resultat: ResultatExerciceFormeCanoniqueFonctionReference): number {
  return (
    (resultat.scoreReconnaissance + resultat.scoreCanonique + resultat.scoreEhChSoy + resultat.scoreTh + resultat.scoreEvCvSox + resultat.scoreTv) / 6
  );
}

export function ResumeSessionFormeCanoniqueFonctionsReference({ resultats, onRecommencer }: Props) {
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
            <th>Canonique</th>
            <th>EH/CH/SOY</th>
            <th>TH</th>
            <th>EV/CV/SOX</th>
            <th>TV</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{formatScore(resultat.scoreReconnaissance)}</td>
              <td>{formatScore(resultat.scoreCanonique)}</td>
              <td>{formatScore(resultat.scoreEhChSoy)}</td>
              <td>{formatScore(resultat.scoreTh)}</td>
              <td>{formatScore(resultat.scoreEvCvSox)}</td>
              <td>{formatScore(resultat.scoreTv)}</td>
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
