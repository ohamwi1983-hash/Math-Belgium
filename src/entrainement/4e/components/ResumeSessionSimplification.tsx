import type { ResultatExerciceSimplification } from "../moteur/typesSimplification";
import { formatScore } from "../ui/formatScore";
import { libelleTypeFraction } from "../ui/formatSimplification";

interface Props {
  resultats: ResultatExerciceSimplification[];
  onRecommencer: () => void;
}

function scoresPertinents(resultat: ResultatExerciceSimplification): number[] {
  return [
    resultat.scoreDenomReduction,
    resultat.scoreDenomReconnaissance,
    resultat.scoreDenomChamp1,
    resultat.scoreDenomChamp2,
    resultat.scoreCEDirecte,
    resultat.scoreNumReduction,
    resultat.scoreNumReconnaissance,
    resultat.scoreNumChamp1,
    resultat.scoreNumChamp2,
    resultat.scoreSimplification,
  ].filter((score): score is number => score !== null);
}

function moyenneExercice(resultat: ResultatExerciceSimplification): number {
  const scores = scoresPertinents(resultat);
  return scores.reduce((somme, score) => somme + score, 0) / scores.length;
}

export function ResumeSessionSimplification({ resultats, onRecommencer }: Props) {
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
            <th>Type</th>
            <th>Simplification</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleTypeFraction(resultat.type)}</td>
              <td>{formatScore(resultat.scoreSimplification)}</td>
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
