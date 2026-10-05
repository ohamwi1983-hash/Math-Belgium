import type { ResultatExerciceEquationDroite } from "../moteur/typesEquationDroite";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceEquationDroite[];
  onRecommencer: () => void;
}

/** Moyenne des notes réellement présentes (2 ou 3 selon le chemin suivi — voir `PhaseEquationDroite`,
 * `typesEquationDroite.ts`) — filtre le score `null` plutôt que de le compter comme 0, même
 * principe que le reste du projet pour un score sautable. */
function moyenneExercice(resultat: ResultatExerciceEquationDroite): number {
  const scores = [resultat.scoreExtraction, resultat.scorePossibilite, resultat.scoreCoefficients, resultat.scorePossibiliteCoefficients].filter(
    (s): s is number => s !== null,
  );
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

function formatScoreCellule(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

export function ResumeSessionEquationDroite({ resultats, onRecommencer }: Props) {
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
              <th>Extraction</th>
              <th>Possibilité</th>
              <th>Coefficients</th>
              <th>Possibilité + équation</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{formatScoreCellule(resultat.scoreExtraction)}</td>
                <td>{formatScoreCellule(resultat.scorePossibilite)}</td>
                <td>{formatScoreCellule(resultat.scoreCoefficients)}</td>
                <td>{formatScoreCellule(resultat.scorePossibiliteCoefficients)}</td>
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
