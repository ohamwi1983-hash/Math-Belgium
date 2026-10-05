import type { ResultatExerciceTableauFrequences } from "../moteur/typesTableauFrequences";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceTableauFrequences[];
  onRecommencer: () => void;
}

/** Moyenne des 4 notes — toujours des `number` ici, aucune étape sautable (structure aussi simple
 * que "Triangle quelconque"/"Forme canonique et transformations" sur ce plan), donc jamais de
 * filtre `!== null` nécessaire. */
function moyenneExercice(resultat: ResultatExerciceTableauFrequences): number {
  return (resultat.scoreIdentification + resultat.scoreFrequences + resultat.scoreCumules + resultat.scoreFrequencesCumulees) / 4;
}

export function ResumeSessionTableauFrequences({ resultats, onRecommencer }: Props) {
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
              <th>Identification</th>
              <th>Fréquences</th>
              <th>Cumulés</th>
              <th>Fréq. cumulées</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{formatScore(resultat.scoreIdentification)}</td>
                <td>{formatScore(resultat.scoreFrequences)}</td>
                <td>{formatScore(resultat.scoreCumules)}</td>
                <td>{formatScore(resultat.scoreFrequencesCumulees)}</td>
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
