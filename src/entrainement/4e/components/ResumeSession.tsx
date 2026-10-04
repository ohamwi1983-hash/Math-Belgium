import type { ResultatExercice } from "../moteur";
import { libelleCategorie } from "../ui/categorieLabels";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExercice[];
  onRecommencer: () => void;
}

/** Moyenne des étapes réellement traversées pour cet exercice (l'isolement n'existe pas toujours). */
function moyenneExercice(resultat: ResultatExercice): number {
  const scores = [
    resultat.scoreSimplification,
    resultat.scoreIsolement,
    resultat.scoreReconnaissance,
    resultat.scoreChampPrincipal,
    resultat.scoreZeros,
  ].filter((score): score is number => score !== null);
  return scores.reduce((somme, score) => somme + score, 0) / scores.length;
}

export function ResumeSession({ resultats, onRecommencer }: Props) {
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
            <th>Catégorie</th>
            <th>Simpl.</th>
            <th>Isol.</th>
            <th>Reco.</th>
            <th>Principal</th>
            <th>Solutions</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleCategorie(resultat.categorie)}</td>
              <td>{resultat.scoreSimplification === null ? "—" : formatScore(resultat.scoreSimplification)}</td>
              <td>{resultat.scoreIsolement === null ? "—" : formatScore(resultat.scoreIsolement)}</td>
              <td>{resultat.scoreReconnaissance === null ? "—" : formatScore(resultat.scoreReconnaissance)}</td>
              <td>{formatScore(resultat.scoreChampPrincipal)}</td>
              <td>{formatScore(resultat.scoreZeros)}</td>
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
