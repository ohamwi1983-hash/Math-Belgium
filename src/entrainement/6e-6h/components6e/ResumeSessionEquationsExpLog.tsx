import type { ResultatExerciceEquationsExpLog } from "../moteur6e/typesEquationsExpLog";
import { calculerTotalPointsEquationsExpLog } from "../ui6e/formatEquationsExpLog";

interface Props {
  resultats: ResultatExerciceEquationsExpLog[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<ResultatExerciceEquationsExpLog["famille"], string> = {
  A: "A — base^(mx+n)=C",
  B: "B — bases différentes",
  C: "C — t-substitution",
  D: "D — log_x(N)=k / log_a(x)=k",
  E: "E — combiner des logs",
  F: "F — changement de base",
  G: "G — toujours vrai/faux",
};

/** Même patron que `ResumeSessionExponentiellesProblemes.tsx` (6gen12) : tableau récapitulatif de
 * TOUS les exercices de la session, une moyenne (jamais un score fractionnaire "X/100" comme SEULE
 * information — voir CLAUDE.md) par exercice, réutilisant les scores RÉELS déjà calculés par
 * `calculerTotalPointsEquationsExpLog`. */
export function ResumeSessionEquationsExpLog({ resultats, onRecommencer }: Props) {
  const moyennes = resultats.map((r) => {
    const { total, maximum } = calculerTotalPointsEquationsExpLog(r);
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
