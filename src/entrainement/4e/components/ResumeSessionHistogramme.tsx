import type { ResultatExerciceHistogramme } from "../moteur/typesHistogramme";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceHistogramme[];
  onRecommencer: () => void;
}

/** Moyenne sur 2 ou 3 notes selon la variante (`scoreFrequences` filtré s'il est `null`, jamais
 * compté comme 0 — même principe que le reste du projet pour un score sautable, ex.
 * "Inéquations rationnelles"/"Caractéristiques algébriques"). */
function moyenneExercice(resultat: ResultatExerciceHistogramme): number {
  const scores = [resultat.scoreClassement, resultat.scoreFrequences, resultat.scoreTrace].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionHistogramme({ resultats, onRecommencer }: Props) {
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
              <th>Classement</th>
              <th>Fréquences</th>
              <th>Tracé</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{resultat.variante === "frequence" ? "Fréquence (%)" : "Effectif"}</td>
                <td>{formatScore(resultat.scoreClassement)}</td>
                <td>{resultat.scoreFrequences === null ? "—" : formatScore(resultat.scoreFrequences)}</td>
                <td>{formatScore(resultat.scoreTrace)}</td>
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
