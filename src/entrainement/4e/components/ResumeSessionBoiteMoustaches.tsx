import type { ResultatExerciceBoiteMoustaches } from "../moteur/typesBoiteMoustaches";
import { libelleVarianteBoiteMoustaches } from "../ui/formatBoiteMoustaches";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceBoiteMoustaches[];
  onRecommencer: () => void;
}

/** Moyenne des notes réellement présentes pour CET exercice (1 pour construction/lecture, 2 pour
 * comparaison) — filtre les scores `null` plutôt que de les compter comme 0, même principe que le
 * reste du projet pour un score sautable. */
function moyenneExercice(resultat: ResultatExerciceBoiteMoustaches): number {
  const scores = [resultat.score, resultat.scoreComparaisonMedianes, resultat.scoreComparaisonDispersions].filter(
    (s): s is number => s !== null,
  );
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

function formatScoreCellule(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

export function ResumeSessionBoiteMoustaches({ resultats, onRecommencer }: Props) {
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
              <th>Variante</th>
              <th>Score</th>
              <th>Médianes</th>
              <th>Dispersions</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{libelleVarianteBoiteMoustaches(resultat.variante)}</td>
                <td>{formatScoreCellule(resultat.score)}</td>
                <td>{formatScoreCellule(resultat.scoreComparaisonMedianes)}</td>
                <td>{formatScoreCellule(resultat.scoreComparaisonDispersions)}</td>
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
