import type { ResultatExerciceNormeDistance } from "../moteur/typesNormeDistance";
import { libelleVarianteNormeDistance } from "../ui/formatNormeDistance";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceNormeDistance[];
  onRecommencer: () => void;
}

/** Moyenne des notes réellement présentes pour CET exercice (1 à 3 selon la variante) — filtre les
 * scores `null` plutôt que de les compter comme 0, même principe que "Colinéarité"/"Orthogonalité". */
function moyenneExercice(resultat: ResultatExerciceNormeDistance): number {
  const scores = [
    resultat.scoreNormeVecteur,
    resultat.scoreConstructionDistance,
    resultat.scoreCalculDistance,
    resultat.scoreConstructionIsocele,
    resultat.scoreCalculIsocele,
    resultat.scoreConclusionIsocele,
    resultat.scoreReductionParametreNorme,
    resultat.scoreResolutionParametreNorme,
    resultat.scoreConstructionPythagore,
    resultat.scoreCalculPythagore,
    resultat.scoreTestPythagore,
  ].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

function formatScoreCellule(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

export function ResumeSessionNormeDistance({ resultats, onRecommencer }: Props) {
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
              <th>Norme</th>
              <th>Constr. AB</th>
              <th>Distance</th>
              <th>Constr. côtés</th>
              <th>Longueurs</th>
              <th>Concl. isocèle</th>
              <th>Réduction</th>
              <th>Résolution</th>
              <th>Constr. côtés</th>
              <th>Longueurs</th>
              <th>Rectangle en</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{libelleVarianteNormeDistance(resultat.variante)}</td>
                <td>{formatScoreCellule(resultat.scoreNormeVecteur)}</td>
                <td>{formatScoreCellule(resultat.scoreConstructionDistance)}</td>
                <td>{formatScoreCellule(resultat.scoreCalculDistance)}</td>
                <td>{formatScoreCellule(resultat.scoreConstructionIsocele)}</td>
                <td>{formatScoreCellule(resultat.scoreCalculIsocele)}</td>
                <td>{formatScoreCellule(resultat.scoreConclusionIsocele)}</td>
                <td>{formatScoreCellule(resultat.scoreReductionParametreNorme)}</td>
                <td>{formatScoreCellule(resultat.scoreResolutionParametreNorme)}</td>
                <td>{formatScoreCellule(resultat.scoreConstructionPythagore)}</td>
                <td>{formatScoreCellule(resultat.scoreCalculPythagore)}</td>
                <td>{formatScoreCellule(resultat.scoreTestPythagore)}</td>
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
