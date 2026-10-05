import type { ResultatExerciceMoyennePonderee } from "../moteur/typesMoyennePonderee";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceMoyennePonderee[];
  onRecommencer: () => void;
}

/** Moyenne sur 2 à 3 notes selon la variante (`scoreCentres` filtré s'il est `null`, jamais compté
 * comme 0 — même principe que le reste du projet pour un score sautable, ex. "Regroupement en
 * classes et histogramme"). */
function moyenneExercice(resultat: ResultatExerciceMoyennePonderee): number {
  const scores = [resultat.scoreCentres, resultat.scoreSommes, resultat.scoreQuotient].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionMoyennePonderee({ resultats, onRecommencer }: Props) {
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
              <th>Centres</th>
              <th>Sommes</th>
              <th>Quotient</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{resultat.variante === "classes" ? "Classes" : "Discrète"}</td>
                <td>{resultat.scoreCentres === null ? "—" : formatScore(resultat.scoreCentres)}</td>
                <td>{formatScore(resultat.scoreSommes)}</td>
                <td>{formatScore(resultat.scoreQuotient)}</td>
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
