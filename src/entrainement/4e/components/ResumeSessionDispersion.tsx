import type { ResultatExerciceDispersion } from "../moteur/typesDispersion";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceDispersion[];
  onRecommencer: () => void;
}

/** Moyenne sur 2 scores, tous deux toujours des `number` — aucune ligne conditionnelle `!== null`
 * ici (structure aussi simple que "Triangle quelconque"/"Étendue et écart interquartile"). */
function moyenneExercice(resultat: ResultatExerciceDispersion): number {
  return (resultat.scoreTableau + resultat.scoreVarianceEcartType) / 2;
}

export function ResumeSessionDispersion({ resultats, onRecommencer }: Props) {
  const moyenne = resultats.reduce((somme, r) => somme + moyenneExercice(r), 0) / resultats.length;

  return (
    <div>
      <h2 className="result-title">Session terminée</h2>
      <p className="result-subtitle">{resultats.length} exercices complétés</p>
      <div className="score-hero">
        <div className="score-hero-value">{moyenne.toFixed(0)}/100</div>
        <div className="score-hero-label">score moyen</div>
      </div>
      <div className="summary-table-scroll">
        <table className="summary-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tableau</th>
              <th>Variance/écart-type</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{formatScore(resultat.scoreTableau)}</td>
                <td>{formatScore(resultat.scoreVarianceEcartType)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn btn-primary" onClick={onRecommencer}>
        Recommencer
      </button>
    </div>
  );
}
