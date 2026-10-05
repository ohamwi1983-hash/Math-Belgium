import type { ResultatExerciceAnglesAssocies } from "../moteur/typesAnglesAssocies";
import { formatScore } from "../ui/formatScore";
import { libelleRelation } from "../ui/formatAnglesAssocies";

interface Props {
  resultats: ResultatExerciceAnglesAssocies[];
  onRecommencer: () => void;
}

/** Refonte écran unique (`promptgen17refontecomplete.md`) — un seul score par exercice désormais
 * (plus de moyenne à calculer entre plusieurs champs conditionnels). */
export function ResumeSessionAnglesAssocies({ resultats, onRecommencer }: Props) {
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
            <th>Relation</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleRelation(resultat.relation)}</td>
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
