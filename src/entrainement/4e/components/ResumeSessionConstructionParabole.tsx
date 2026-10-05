import type { ResultatExerciceConstructionParabole } from "../moteur/typesConstructionParabole";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceConstructionParabole[];
  onRecommencer: () => void;
}

/** Moyenne sur les 3 itérations + le tracé (4 notes par exercice). */
function moyenneExercice(resultat: ResultatExerciceConstructionParabole): number {
  const total = resultat.iterations.reduce((somme, iteration) => somme + iteration.scoreConstruction, 0) + resultat.scoreTrace;
  return total / (resultat.iterations.length + 1);
}

export function ResumeSessionConstructionParabole({ resultats, onRecommencer }: Props) {
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
            <th>Itération 1</th>
            <th>Itération 2</th>
            <th>Itération 3</th>
            <th>Tracé</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              {resultat.iterations.map((iteration, i) => (
                <td key={i}>{formatScore(iteration.scoreConstruction)}</td>
              ))}
              <td>{formatScore(resultat.scoreTrace)}</td>
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
