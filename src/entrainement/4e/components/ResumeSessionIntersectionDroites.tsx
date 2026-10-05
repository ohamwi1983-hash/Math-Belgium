import type { ResultatExerciceIntersectionDroites } from "../moteur/typesIntersectionDroites";
import { LIBELLE_CONCLUSION, LIBELLE_VARIANTE } from "../ui/formatIntersectionDroites";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceIntersectionDroites[];
  onRecommencer: () => void;
}

/** Moyenne de l'exercice — `scorePoint` filtré s'il vaut `null` (exercice non sécant, écran
 * jamais atteint), jamais compté comme 0. */
function moyenneExercice(resultat: ResultatExerciceIntersectionDroites): number {
  const scores = [resultat.scoreDiagnostic, resultat.scorePoint].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionIntersectionDroites({ resultats, onRecommencer }: Props) {
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
            <th>Conclusion</th>
            <th>Diagnostic</th>
            <th>Point</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
              <td>{LIBELLE_CONCLUSION[resultat.conclusion]}</td>
              <td>{formatScore(resultat.scoreDiagnostic)}</td>
              <td>{resultat.scorePoint !== null ? formatScore(resultat.scorePoint) : "—"}</td>
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
