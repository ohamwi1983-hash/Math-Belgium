import type { ResultatExerciceExponentiellesProblemes } from "../moteur6e/typesExponentiellesProblemes";
import { calculerTotalPointsExponentiellesProblemes } from "../ui6e/formatExponentiellesProblemes";

interface Props {
  resultats: ResultatExerciceExponentiellesProblemes[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<ResultatExerciceExponentiellesProblemes["famille"], string> = {
  A: "A — Évaluer/résoudre Q(t)=Q0·r^t",
  B: "B — Modèle complémentaire",
  C: "C — 2 points, taux inconnu",
  D: "D — Asymptote non nulle",
  E: "E — Optimisation",
  F: "F — Saturation, coûts/revenus",
  G: "G — Seuil critique, décision",
};

/** Même patron que `ResumeSessionEquationExponentielle.tsx` (6gen9) : tableau récapitulatif de
 * TOUS les exercices de la session, une moyenne (jamais un score fractionnaire "X/100" comme
 * SEULE information — voir CLAUDE.md) par exercice, réutilisant les scores RÉELS déjà calculés par
 * `calculerTotalPointsExponentiellesProblemes`. */
export function ResumeSessionExponentiellesProblemes({ resultats, onRecommencer }: Props) {
  const moyennes = resultats.map((r) => {
    const { total, maximum } = calculerTotalPointsExponentiellesProblemes(r);
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
