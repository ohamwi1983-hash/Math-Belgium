import type { ResultatExerciceColinearite } from "../moteur/typesColinearite";
import { libelleVarianteColinearite } from "../ui/formatColinearite";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceColinearite[];
  onRecommencer: () => void;
}

/** Moyenne des notes réellement présentes pour CET exercice (1 à 3 selon la variante) — filtre les
 * scores `null` plutôt que de les compter comme 0, même principe que le reste du projet pour un
 * score sautable (ex. "Caractéristiques algébriques d'une fonction de référence"). */
function moyenneExercice(resultat: ResultatExerciceColinearite): number {
  const scores = [resultat.scoreConstruction, resultat.scoreReduction, resultat.scoreResolution, resultat.scoreTest].filter(
    (s): s is number => s !== null,
  );
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

function formatScoreCellule(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

export function ResumeSessionColinearite({ resultats, onRecommencer }: Props) {
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
            <th>Construction</th>
            <th>Réduction</th>
            <th>Résolution</th>
            <th>Test</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleVarianteColinearite(resultat.variante)}</td>
              <td>{formatScoreCellule(resultat.scoreConstruction)}</td>
              <td>{formatScoreCellule(resultat.scoreReduction)}</td>
              <td>{formatScoreCellule(resultat.scoreResolution)}</td>
              <td>{formatScoreCellule(resultat.scoreTest)}</td>
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
