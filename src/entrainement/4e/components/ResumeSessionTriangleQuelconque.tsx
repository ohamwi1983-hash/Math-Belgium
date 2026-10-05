import type { ResultatExerciceTriangleQuelconque } from "../moteur/typesTriangleQuelconque";
import { libelleConfiguration } from "../ui/formatTriangleQuelconque";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceTriangleQuelconque[];
  onRecommencer: () => void;
}

/** Moyenne des 2 notes — toujours des `number` ici, aucune étape sautable (contrairement à
 * l'ancienne "Aire"), donc jamais de filtre `!== null` nécessaire. */
function moyenneExercice(resultat: ResultatExerciceTriangleQuelconque): number {
  return (resultat.scoreDonneeManquante + resultat.scoreAire) / 2;
}

export function ResumeSessionTriangleQuelconque({ resultats, onRecommencer }: Props) {
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
            <th>Configuration</th>
            <th>Donnée manquante</th>
            <th>Aire</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleConfiguration(resultat.configuration)}</td>
              <td>{formatScore(resultat.scoreDonneeManquante)}</td>
              <td>{formatScore(resultat.scoreAire)}</td>
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
