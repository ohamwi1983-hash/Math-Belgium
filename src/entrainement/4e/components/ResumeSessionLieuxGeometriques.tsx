import type { ResultatExerciceLieuxGeometriques } from "../moteur/typesLieuxGeometriques";
import { LIBELLE_PAIRE } from "../ui/formatLieuxGeometriques";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceLieuxGeometriques[];
  onRecommencer: () => void;
}

/** Les 3 scores sont toujours des `number` — moyenne directe sur `/3`, jamais de filtre `!== null`
 * nécessaire (les 3 écrans sont désormais TOUJOURS traversés). */
function moyenneExercice(resultat: ResultatExerciceLieuxGeometriques): number {
  return (resultat.scoreIdentification + resultat.scoreEquations + resultat.scoreResolution) / 3;
}

export function ResumeSessionLieuxGeometriques({ resultats, onRecommencer }: Props) {
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
              <th>Points</th>
              <th>Identification</th>
              <th>Équations</th>
              <th>Résolution</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{LIBELLE_PAIRE[resultat.paire]}</td>
                <td>{resultat.nombrePoints}</td>
                <td>{formatScore(resultat.scoreIdentification)}</td>
                <td>{formatScore(resultat.scoreEquations)}</td>
                <td>{formatScore(resultat.scoreResolution)}</td>
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
