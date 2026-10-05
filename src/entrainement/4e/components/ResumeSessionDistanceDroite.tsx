import type { ResultatExerciceDistanceDroite } from "../moteur/typesDistanceDroite";
import { LIBELLE_VARIANTE } from "../ui/formatDistanceDroite";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceDistanceDroite[];
  onRecommencer: () => void;
}

/** Filtre `scoreChoixPoint` quand `null` (variante "point") plutôt que de le compter comme 0 —
 * même principe que le reste du projet pour un score sautable. */
function moyenneExercice(resultat: ResultatExerciceDistanceDroite): number {
  const scores = [resultat.scoreChoixPoint, resultat.scoreEquationB, resultat.scoreIntersectionQ, resultat.scoreDistancePQ].filter(
    (s): s is number => s !== null,
  );
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

function formatScoreCellule(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

export function ResumeSessionDistanceDroite({ resultats, onRecommencer }: Props) {
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
            <th>Variante</th>
            <th>Choix point</th>
            <th>Équation B</th>
            <th>Intersection Q</th>
            <th>Distance PQ</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
              <td>{formatScoreCellule(resultat.scoreChoixPoint)}</td>
              <td>{formatScoreCellule(resultat.scoreEquationB)}</td>
              <td>{formatScoreCellule(resultat.scoreIntersectionQ)}</td>
              <td>{formatScoreCellule(resultat.scoreDistancePQ)}</td>
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
