import type { ResultatExerciceComparaisonSeries } from "../moteur/typesComparaisonSeries";
import { libelleTypeQuestion, libelleVarianteComparaisonSeries } from "../ui/formatComparaisonSeries";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceComparaisonSeries[];
  onRecommencer: () => void;
}

export function ResumeSessionComparaisonSeries({ resultats, onRecommencer }: Props) {
  const moyenne = resultats.reduce((somme, r) => somme + r.score, 0) / resultats.length;

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
              <th>Variante</th>
              <th>Type de question</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{libelleVarianteComparaisonSeries(resultat.variante)}</td>
                <td>{libelleTypeQuestion(resultat.typeQuestion)}</td>
                <td>{formatScore(resultat.score)}</td>
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
