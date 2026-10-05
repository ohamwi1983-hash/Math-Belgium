import type { ResultatExerciceSynthese } from "../moteur/typesExerciceSynthese";
import { libelleVarianteExerciceSynthese } from "../ui/formatExerciceSynthese";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceSynthese[];
  onRecommencer: () => void;
}

/** Moyenne des notes réellement présentes pour CET exercice (11 pour "discrete", 13 pour
 * "classes") — filtre les scores `null` plutôt que de les compter comme 0, même principe que
 * "Orthogonalité"/"Paramètres de position". */
function moyenneExercice(resultat: ResultatExerciceSynthese): number {
  const scores = [
    resultat.scoreCentres,
    resultat.scoreSommes,
    resultat.scoreQuotient,
    resultat.scoreMediane,
    resultat.scoreQ1,
    resultat.scoreQ3,
    resultat.scoreMinMaxMode,
    resultat.scorePolygone,
    resultat.scoreLectureMediane,
    resultat.scoreLectureQ1,
    resultat.scoreLectureQ3,
    resultat.scoreSynthese,
    resultat.scoreBoxplot,
    resultat.scoreTableau,
    resultat.scoreVarianceEcartType,
    resultat.scoreBtIntervalle,
    resultat.scoreBtPourcent,
  ].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

function formatScoreCellule(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

export function ResumeSessionExerciceSynthese({ resultats, onRecommencer }: Props) {
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
              <th>Médiane</th>
              <th>Q1</th>
              <th>Q3</th>
              <th>Min/Max/Mode</th>
              <th>Polygone</th>
              <th>Lect. médiane</th>
              <th>Lect. Q1</th>
              <th>Lect. Q3</th>
              <th>Synthèse</th>
              <th>Boxplot</th>
              <th>Tableau (V)</th>
              <th>Variance/σ</th>
              <th>BT intervalle</th>
              <th>BT %</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{libelleVarianteExerciceSynthese(resultat.variante)}</td>
                <td>{formatScoreCellule(resultat.scoreCentres)}</td>
                <td>{formatScoreCellule(resultat.scoreSommes)}</td>
                <td>{formatScoreCellule(resultat.scoreQuotient)}</td>
                <td>{formatScoreCellule(resultat.scoreMediane)}</td>
                <td>{formatScoreCellule(resultat.scoreQ1)}</td>
                <td>{formatScoreCellule(resultat.scoreQ3)}</td>
                <td>{formatScoreCellule(resultat.scoreMinMaxMode)}</td>
                <td>{formatScoreCellule(resultat.scorePolygone)}</td>
                <td>{formatScoreCellule(resultat.scoreLectureMediane)}</td>
                <td>{formatScoreCellule(resultat.scoreLectureQ1)}</td>
                <td>{formatScoreCellule(resultat.scoreLectureQ3)}</td>
                <td>{formatScoreCellule(resultat.scoreSynthese)}</td>
                <td>{formatScoreCellule(resultat.scoreBoxplot)}</td>
                <td>{formatScoreCellule(resultat.scoreTableau)}</td>
                <td>{formatScoreCellule(resultat.scoreVarianceEcartType)}</td>
                <td>{formatScoreCellule(resultat.scoreBtIntervalle)}</td>
                <td>{formatScoreCellule(resultat.scoreBtPourcent)}</td>
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
