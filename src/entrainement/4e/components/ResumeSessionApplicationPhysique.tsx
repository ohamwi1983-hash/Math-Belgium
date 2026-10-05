import type { ResultatExerciceApplicationPhysique } from "../moteur/typesApplicationPhysique";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceApplicationPhysique[];
  onRecommencer: () => void;
}

function moyenneExercice(resultat: ResultatExerciceApplicationPhysique): number {
  return (resultat.scoreModelisation + resultat.scoreNorme + resultat.scoreDeviation + resultat.scoreInterpretation) / 4;
}

export function ResumeSessionApplicationPhysique({ resultats, onRecommencer }: Props) {
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
            <th>Configuration</th>
            <th>Norme</th>
            <th>Déviation</th>
            <th>Interprétation</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{formatScore(resultat.scoreModelisation)}</td>
              <td>{formatScore(resultat.scoreNorme)}</td>
              <td>{formatScore(resultat.scoreDeviation)}</td>
              <td>{formatScore(resultat.scoreInterpretation)}</td>
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
