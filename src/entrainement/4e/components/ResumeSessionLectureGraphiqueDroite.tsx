import type { ResultatExerciceLectureGraphiqueDroite } from "../moteur/typesLectureGraphiqueDroite";
import { LIBELLE_VARIANTE } from "../ui/formatLectureGraphiqueDroite";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceLectureGraphiqueDroite[];
  onRecommencer: () => void;
}

export function ResumeSessionLectureGraphiqueDroite({ resultats, onRecommencer }: Props) {
  const moyenne = resultats.reduce((somme, r) => somme + r.score, 0) / resultats.length;

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
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
              <td>{formatScore(resultat.score)}</td>
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
