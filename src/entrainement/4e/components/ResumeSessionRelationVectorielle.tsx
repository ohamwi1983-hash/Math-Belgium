import type { ResultatExerciceRelationVectorielle } from "../moteur/typesRelationVectorielle";
import { libelleVarianteRelationVectorielle } from "../ui/formatRelationVectorielle";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceRelationVectorielle[];
  onRecommencer: () => void;
}

/** Moyenne filtrant `scoreTraduction` quand `null` (variante `translation`, étape sautée) plutôt
 * que de le compter comme 0 — même principe que le reste du projet pour un score sautable. */
function moyenneExercice(resultat: ResultatExerciceRelationVectorielle): number {
  const scores = [resultat.scoreTraduction, resultat.scoreCoordonnees].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionRelationVectorielle({ resultats, onRecommencer }: Props) {
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
            <th>Traduction</th>
            <th>Coordonnées</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleVarianteRelationVectorielle(resultat.variante)}</td>
              <td>{resultat.scoreTraduction !== null ? formatScore(resultat.scoreTraduction) : "—"}</td>
              <td>{formatScore(resultat.scoreCoordonnees)}</td>
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
