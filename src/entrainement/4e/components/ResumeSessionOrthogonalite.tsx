import type { ResultatExerciceOrthogonalite } from "../moteur/typesOrthogonalite";
import { libelleVarianteOrthogonalite } from "../ui/formatOrthogonalite";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceOrthogonalite[];
  onRecommencer: () => void;
}

/** Moyenne des notes réellement présentes pour CET exercice (1 à 5 selon la variante) — filtre les
 * scores `null` plutôt que de les compter comme 0, même principe que "Colinéarité et alignement de
 * points". */
function moyenneExercice(resultat: ResultatExerciceOrthogonalite): number {
  const scores = [
    resultat.scoreTest,
    resultat.scoreReductionParametre,
    resultat.scoreResolutionParametre,
    resultat.scoreConstructionTriangle,
    resultat.scoreTestSommetA,
    resultat.scoreTestSommetB,
    resultat.scoreTestSommetC,
    resultat.scoreConclusionTriangle,
    resultat.scoreConstructionAvecX,
    resultat.scoreReductionSommetA,
    resultat.scoreReductionSommetB,
    resultat.scoreReductionSommetC,
    resultat.scoreIdentificationResolution,
  ].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

function formatScoreCellule(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

export function ResumeSessionOrthogonalite({ resultats, onRecommencer }: Props) {
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
              <th>Test</th>
              <th>Réduction</th>
              <th>Résolution</th>
              <th>Construction</th>
              <th>Test A</th>
              <th>Test B</th>
              <th>Test C</th>
              <th>Conclusion</th>
              <th>Constr. x</th>
              <th>Réd. A</th>
              <th>Réd. B</th>
              <th>Réd. C</th>
              <th>Identif./Résol.</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{libelleVarianteOrthogonalite(resultat.variante)}</td>
                <td>{formatScoreCellule(resultat.scoreTest)}</td>
                <td>{formatScoreCellule(resultat.scoreReductionParametre)}</td>
                <td>{formatScoreCellule(resultat.scoreResolutionParametre)}</td>
                <td>{formatScoreCellule(resultat.scoreConstructionTriangle)}</td>
                <td>{formatScoreCellule(resultat.scoreTestSommetA)}</td>
                <td>{formatScoreCellule(resultat.scoreTestSommetB)}</td>
                <td>{formatScoreCellule(resultat.scoreTestSommetC)}</td>
                <td>{formatScoreCellule(resultat.scoreConclusionTriangle)}</td>
                <td>{formatScoreCellule(resultat.scoreConstructionAvecX)}</td>
                <td>{formatScoreCellule(resultat.scoreReductionSommetA)}</td>
                <td>{formatScoreCellule(resultat.scoreReductionSommetB)}</td>
                <td>{formatScoreCellule(resultat.scoreReductionSommetC)}</td>
                <td>{formatScoreCellule(resultat.scoreIdentificationResolution)}</td>
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
