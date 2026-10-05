import type { ResultatExerciceRelationsDroites } from "../moteur/typesRelationsDroites";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceRelationsDroites[];
  onRecommencer: () => void;
}

/** Les 3 scores sont toujours des `number` — moyenne directe sur `/3`, jamais de filtre `!== null`
 * nécessaire (même simplicité que "Construction graphique — tracer une droite"). */
function moyenneExercice(resultat: ResultatExerciceRelationsDroites): number {
  return (resultat.scoreExtraction + resultat.scoreConstruction + resultat.scoreEquation) / 3;
}

export function ResumeSessionRelationsDroites({ resultats, onRecommencer }: Props) {
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
            <th>Critère</th>
            <th>Extraction</th>
            <th>Construction</th>
            <th>Équation</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{resultat.critere === "parallele" ? "Parallèle" : "Perpendiculaire"}</td>
              <td>{formatScore(resultat.scoreExtraction)}</td>
              <td>{formatScore(resultat.scoreConstruction)}</td>
              <td>{formatScore(resultat.scoreEquation)}</td>
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
