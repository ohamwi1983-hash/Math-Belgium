import type { ResultatExerciceMediane } from "../moteur/typesMediane";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceMediane[];
  onRecommencer: () => void;
}

/** Moyenne sur 4 notes selon la variante (jusqu'à 7 scores potentiellement `null`, filtrés, jamais
 * comptés comme 0 — même principe que "Moyenne pondérée"/"Regroupement en classes et
 * histogramme"). */
function moyenneExercice(resultat: ResultatExerciceMediane): number {
  const scores = [
    resultat.scoreMediane,
    resultat.scoreQ1,
    resultat.scoreQ3,
    resultat.scoreMinMaxMode,
    resultat.scorePolygone,
    resultat.scoreLectureQ1,
    resultat.scoreLectureMediane,
    resultat.scoreLectureQ3,
    resultat.scoreSynthese,
  ].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionMediane({ resultats, onRecommencer }: Props) {
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
              <th>Médiane</th>
              <th>Q1</th>
              <th>Q3</th>
              <th>Min/Max/Mode(s)</th>
              <th>Polygone</th>
              <th>Lecture Q1</th>
              <th>Lecture médiane</th>
              <th>Lecture Q3</th>
              <th>Synthèse</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{resultat.variante === "classes" ? "Classes" : "Discrète"}</td>
                <td>{resultat.scoreMediane === null ? "—" : formatScore(resultat.scoreMediane)}</td>
                <td>{resultat.scoreQ1 === null ? "—" : formatScore(resultat.scoreQ1)}</td>
                <td>{resultat.scoreQ3 === null ? "—" : formatScore(resultat.scoreQ3)}</td>
                <td>{resultat.scoreMinMaxMode === null ? "—" : formatScore(resultat.scoreMinMaxMode)}</td>
                <td>{resultat.scorePolygone === null ? "—" : formatScore(resultat.scorePolygone)}</td>
                <td>{resultat.scoreLectureQ1 === null ? "—" : formatScore(resultat.scoreLectureQ1)}</td>
                <td>{resultat.scoreLectureMediane === null ? "—" : formatScore(resultat.scoreLectureMediane)}</td>
                <td>{resultat.scoreLectureQ3 === null ? "—" : formatScore(resultat.scoreLectureQ3)}</td>
                <td>{resultat.scoreSynthese === null ? "—" : formatScore(resultat.scoreSynthese)}</td>
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
