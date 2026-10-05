import type { ResultatExerciceCombinaisonVecteurs } from "../moteur/typesCombinaisonVecteurs";
import { libelleVarianteCombinaisonVecteurs } from "../ui/formatCombinaisonVecteurs";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceCombinaisonVecteurs[];
  onRecommencer: () => void;
}

/** Moyenne des 2 notes — toujours des `number` ici, aucune étape sautable, donc jamais de filtre
 * `!== null` nécessaire (même principe que "Triangle quelconque"). */
function moyenneExercice(resultat: ResultatExerciceCombinaisonVecteurs): number {
  return (resultat.scoreSimplification + resultat.scoreComposantes) / 2;
}

export function ResumeSessionCombinaisonVecteurs({ resultats, onRecommencer }: Props) {
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
            <th>Réduction</th>
            <th>Composantes</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleVarianteCombinaisonVecteurs(resultat.variante)}</td>
              <td>{formatScore(resultat.scoreSimplification)}</td>
              <td>{formatScore(resultat.scoreComposantes)}</td>
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
