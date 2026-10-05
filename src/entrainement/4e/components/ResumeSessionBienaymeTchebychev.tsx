import type { ResultatExerciceBienaymeTchebychev } from "../moteur/typesBienaymeTchebychev";
import { libelleVarianteBienaymeTchebychev } from "../ui/formatBienaymeTchebychev";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceBienaymeTchebychev[];
  onRecommencer: () => void;
}

/** Moyenne des notes réellement présentes pour CET exercice (2 ou 3 sur les 20 possibles selon la
 * variante) — filtre les scores `null` plutôt que de les compter comme 0, même principe que
 * "Orthogonalité"/"Colinéarité". */
function moyenneExercice(resultat: ResultatExerciceBienaymeTchebychev): number {
  const scores = [
    resultat.scoreV1K,
    resultat.scoreV1Pourcent,
    resultat.scoreV2K,
    resultat.scoreV2Intervalle,
    resultat.scoreV3K,
    resultat.scoreV3Pourcent,
    resultat.scoreV3Nombre,
    resultat.scoreV4Pourcent0,
    resultat.scoreV4K,
    resultat.scoreV4Intervalle,
    resultat.scoreV5K,
    resultat.scoreV5Sigma,
    resultat.scoreV6K,
    resultat.scoreV6XBar,
    resultat.scoreV7Pourcent0,
    resultat.scoreV7K,
    resultat.scoreV7Sigma,
    resultat.scoreV8Pourcent0,
    resultat.scoreV8K,
    resultat.scoreV8XBar,
  ].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

function formatScoreCellule(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

export function ResumeSessionBienaymeTchebychev({ resultats, onRecommencer }: Props) {
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
              <th>V1 k</th>
              <th>V1 %</th>
              <th>V2 k</th>
              <th>V2 Interv.</th>
              <th>V3 k</th>
              <th>V3 %</th>
              <th>V3 n</th>
              <th>V4 %₀</th>
              <th>V4 k</th>
              <th>V4 Interv.</th>
              <th>V5 k</th>
              <th>V5 σ</th>
              <th>V6 k</th>
              <th>V6 x̄</th>
              <th>V7 %₀</th>
              <th>V7 k</th>
              <th>V7 σ</th>
              <th>V8 %₀</th>
              <th>V8 k</th>
              <th>V8 x̄</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{libelleVarianteBienaymeTchebychev(resultat.variante)}</td>
                <td>{formatScoreCellule(resultat.scoreV1K)}</td>
                <td>{formatScoreCellule(resultat.scoreV1Pourcent)}</td>
                <td>{formatScoreCellule(resultat.scoreV2K)}</td>
                <td>{formatScoreCellule(resultat.scoreV2Intervalle)}</td>
                <td>{formatScoreCellule(resultat.scoreV3K)}</td>
                <td>{formatScoreCellule(resultat.scoreV3Pourcent)}</td>
                <td>{formatScoreCellule(resultat.scoreV3Nombre)}</td>
                <td>{formatScoreCellule(resultat.scoreV4Pourcent0)}</td>
                <td>{formatScoreCellule(resultat.scoreV4K)}</td>
                <td>{formatScoreCellule(resultat.scoreV4Intervalle)}</td>
                <td>{formatScoreCellule(resultat.scoreV5K)}</td>
                <td>{formatScoreCellule(resultat.scoreV5Sigma)}</td>
                <td>{formatScoreCellule(resultat.scoreV6K)}</td>
                <td>{formatScoreCellule(resultat.scoreV6XBar)}</td>
                <td>{formatScoreCellule(resultat.scoreV7Pourcent0)}</td>
                <td>{formatScoreCellule(resultat.scoreV7K)}</td>
                <td>{formatScoreCellule(resultat.scoreV7Sigma)}</td>
                <td>{formatScoreCellule(resultat.scoreV8Pourcent0)}</td>
                <td>{formatScoreCellule(resultat.scoreV8K)}</td>
                <td>{formatScoreCellule(resultat.scoreV8XBar)}</td>
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
