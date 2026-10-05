import type { ResultatExercicePositionDroitePlan } from "../moteur/typesPositionDroitePlan";
import { LIBELLE_CLASSIFICATION } from "../ui/formatPositionDroitePlan";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExercicePositionDroitePlan[];
  onRecommencer: () => void;
}

/** Moyenne des 2 notes — toujours des `number` ici, aucune étape sautable, donc jamais de filtre
 * `!== null` nécessaire. */
function moyenneExercice(resultat: ResultatExercicePositionDroitePlan): number {
  return (resultat.scoreClassification + resultat.scoreJustification) / 2;
}

export function ResumeSessionPositionDroitePlan({ resultats, onRecommencer }: Props) {
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
            <th>Classification</th>
            <th>Justification</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_CLASSIFICATION[resultat.classification]}</td>
              <td>{formatScore(resultat.scoreClassification)}</td>
              <td>{formatScore(resultat.scoreJustification)}</td>
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
