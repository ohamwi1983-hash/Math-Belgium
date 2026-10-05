import type { ResultatExerciceInequation } from "../moteur/sessionInequation";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceInequation[];
  onRecommencer: () => void;
}

/** Moyenne des étapes réellement traversées pour cet exercice (la simplification n'existe pas toujours). */
function moyenneExercice(resultat: ResultatExerciceInequation): number {
  const scores = [resultat.scoreSimplification, resultat.scoreRacines, resultat.scoreSigneA, resultat.scoreIntervalle].filter(
    (score): score is number => score !== null,
  );
  return scores.reduce((somme, score) => somme + score, 0) / scores.length;
}

export function ResumeSessionInequation({ resultats, onRecommencer }: Props) {
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
            <th>Simpl.</th>
            <th>Zéros</th>
            <th>Signe a</th>
            <th>Intervalle</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{resultat.scoreSimplification === null ? "—" : formatScore(resultat.scoreSimplification)}</td>
              <td>{formatScore(resultat.scoreRacines)}</td>
              <td>{formatScore(resultat.scoreSigneA)}</td>
              <td>{formatScore(resultat.scoreIntervalle)}</td>
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
