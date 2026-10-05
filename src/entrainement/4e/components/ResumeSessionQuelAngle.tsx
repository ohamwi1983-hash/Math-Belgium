import type { FonctionTrig } from "../core/quelAngle.types";
import type { ResultatExerciceQuelAngle } from "../moteur/typesQuelAngle";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceQuelAngle[];
  onRecommencer: () => void;
}

const LIBELLE_FONCTION: Record<FonctionTrig, string> = { sin: "sin α = k", cos: "cos α = k", tan: "tan α = k" };

export function ResumeSessionQuelAngle({ resultats, onRecommencer }: Props) {
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
              <td>{LIBELLE_FONCTION[resultat.fonction]}</td>
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
