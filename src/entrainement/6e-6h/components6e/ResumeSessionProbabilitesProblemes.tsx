import type { ResultatExerciceProbabilitesProblemes } from "../moteur6e/typesProbabilitesProblemes";
import { calculerTotalPointsProbabilitesProblemes, libelleFamilleSousType } from "../ui6e/formatProbabilitesProblemes";

interface Props {
  resultats: ResultatExerciceProbabilitesProblemes[];
  onRecommencer: () => void;
}

/** Résumé de session — mêmes conventions que `ResumeSessionIndependanceBayes.tsx`/
 * `ResumeSessionProbabilitesEnsembles.tsx` : une moyenne (jamais un score fractionnaire "X/100"
 * isolé) par exercice, réutilisant les scores RÉELS déjà calculés par
 * `calculerTotalPointsProbabilitesProblemes`. */
export function ResumeSessionProbabilitesProblemes({ resultats, onRecommencer }: Props) {
  const moyennes = resultats.map((r) => {
    const { total, maximum } = calculerTotalPointsProbabilitesProblemes(r);
    return (total / maximum) * 100;
  });
  const moyenneGenerale = moyennes.reduce((a, m) => a + m, 0) / moyennes.length;

  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Exercice</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{libelleFamilleSousType(r.exercice)}</td>
              <td>{Math.round(moyennes[i])}/100</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Moyenne générale : {Math.round(moyenneGenerale)}/100</p>
      <button type="button" className="btn btn-primary" onClick={onRecommencer}>
        Recommencer
      </button>
    </div>
  );
}
