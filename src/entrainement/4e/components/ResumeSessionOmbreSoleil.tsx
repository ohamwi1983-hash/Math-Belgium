import type { ResultatExerciceOmbreSoleil } from "../moteur/typesOmbreSoleil";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceOmbreSoleil[];
  onRecommencer: () => void;
}

/** Moyenne de session — moyenne des `scoreMoyen` déjà agrégés par exercice (jamais recalculée
 * depuis les scores bruts, chaque exercice pouvant avoir un nombre d'étapes différent). */
export function ResumeSessionOmbreSoleil({ resultats, onRecommencer }: Props) {
  const moyenne = resultats.reduce((somme, r) => somme + r.scoreMoyen, 0) / resultats.length;

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
            <th>Nb. étapes</th>
            <th>Score moyen</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{resultat.scores.length}</td>
              <td>{formatScore(resultat.scoreMoyen)}</td>
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
