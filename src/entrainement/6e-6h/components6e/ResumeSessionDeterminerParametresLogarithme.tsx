import type { ResultatExerciceDeterminerParametresLogarithme } from "../moteur6e/typesDeterminerParametresLogarithme";
import { calculerTotalPointsDeterminerParametresLogarithme } from "../ui6e/formatDeterminerParametresLogarithme";

interface Props {
  resultats: ResultatExerciceDeterminerParametresLogarithme[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<ResultatExerciceDeterminerParametresLogarithme["famille"], string> = {
  A: "A — ln(mx+n), asymptote + condition",
  B: "B — ln(px²+qx+r), 2 racines + point",
  C: "C — conditions pour un extremum",
};

/** Même patron que `ResumeSessionExponentiellesProblemes.tsx` (6gen12) : tableau récapitulatif de
 * TOUS les exercices de la session, une moyenne (jamais un score fractionnaire "X/100" comme SEULE
 * information — voir CLAUDE.md) par exercice, réutilisant les scores RÉELS déjà calculés par
 * `calculerTotalPointsDeterminerParametresLogarithme`. */
export function ResumeSessionDeterminerParametresLogarithme({ resultats, onRecommencer }: Props) {
  const moyennes = resultats.map((r) => {
    const { total, maximum } = calculerTotalPointsDeterminerParametresLogarithme(r);
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
              <td>{LIBELLE_FAMILLE[r.famille]}</td>
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
