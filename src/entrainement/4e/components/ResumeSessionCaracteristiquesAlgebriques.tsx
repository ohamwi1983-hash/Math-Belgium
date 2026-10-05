import type { ResultatExerciceCaracteristiquesAlgebriques } from "../moteur/typesCaracteristiquesAlgebriques";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceCaracteristiquesAlgebriques[];
  onRecommencer: () => void;
}

/**
 * Scores présents pour un exercice donné — filtre tous les champs conditionnels (`number | null`),
 * niveau 1 (séparation/débarrasser, mutuellement exclusifs) comme niveau 2
 * (validité/regroupe/résolution des branches/validation×N), `scoreZeros` toujours un `number`
 * (plus aucune famille ne se clôt ailleurs, `prompt-corrections-niveau2-vague2.md`) — même principe
 * que `ResumeSessionInequationRationnelle`.
 */
function scoresPresents(resultat: ResultatExerciceCaracteristiquesAlgebriques): number[] {
  return [
    resultat.scoreOrdonnee,
    resultat.scoreCE,
    resultat.scoreDomaine,
    resultat.scoreIsolement,
    resultat.scoreSeparation,
    resultat.scoreDebarrasser,
    resultat.scoreValidite,
    resultat.scoreRegroupe,
    resultat.scoreResolutionBranches,
    ...resultat.scoresValidationSolution,
    resultat.scoreZeros,
  ].filter((score): score is number => score !== null);
}

function moyenneExercice(resultat: ResultatExerciceCaracteristiquesAlgebriques): number {
  const scores = scoresPresents(resultat);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionCaracteristiquesAlgebriques({ resultats, onRecommencer }: Props) {
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
            <th>Ordonnée</th>
            <th>CE</th>
            <th>Domaine</th>
            <th>Isolement</th>
            <th>Zéros</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{formatScore(resultat.scoreOrdonnee)}</td>
              <td>{formatScore(resultat.scoreCE)}</td>
              <td>{formatScore(resultat.scoreDomaine)}</td>
              <td>{formatScore(resultat.scoreIsolement)}</td>
              <td>{formatScore(resultat.scoreZeros)}</td>
              <td>{formatScore(moyenneExercice(resultat))}</td>
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
