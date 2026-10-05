import type { ResultatExerciceInequationRationnelle } from "../moteur/sessionInequationRationnelle";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceInequationRationnelle[];
  onRecommencer: () => void;
}

/**
 * Scores présents pour un exercice donné (filtre isoler/combiner quand null (niveau 1), et
 * racineNumerateur/reconnaissance/champ1/champ2 selon le niveau — un seul des deux groupes est
 * jamais présent à la fois, voir core/inequationRationnelle.types.ts) — même principe que
 * ResumeSessionSignesProduit.
 */
function scoresPresents(resultat: ResultatExerciceInequationRationnelle): number[] {
  return [
    resultat.scoreIsoler,
    resultat.scoreCombiner,
    resultat.scoreCE,
    resultat.scoreRacineNumerateur,
    resultat.scoreReconnaissance,
    resultat.scoreChamp1,
    resultat.scoreChamp2,
    resultat.scoreGrille,
    resultat.scoreIntervalle,
  ].filter((score): score is number => score !== null);
}

function moyenneExercice(resultat: ResultatExerciceInequationRationnelle): number {
  const scores = scoresPresents(resultat);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

/** "—" pour une étape sautée (niveau 1, pas d'isoler/combiner), sinon le score formaté. */
function formatScoreOuTiret(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

export function ResumeSessionInequationRationnelle({ resultats, onRecommencer }: Props) {
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
            <th>Isoler</th>
            <th>Combiner</th>
            <th>CE</th>
            <th>Racine N</th>
            <th>Tableau</th>
            <th>Intervalle</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{formatScoreOuTiret(resultat.scoreIsoler)}</td>
              <td>{formatScoreOuTiret(resultat.scoreCombiner)}</td>
              <td>{formatScore(resultat.scoreCE)}</td>
              <td>{formatScoreOuTiret(resultat.scoreRacineNumerateur)}</td>
              <td>{formatScore(resultat.scoreGrille)}</td>
              <td>{formatScore(resultat.scoreIntervalle)}</td>
              <td>{formatScore(moyenneExercice(resultat))}</td>
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
