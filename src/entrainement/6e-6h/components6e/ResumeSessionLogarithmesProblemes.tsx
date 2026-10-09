import type { ResultatExerciceLogarithmesProblemes } from "../moteur6e/typesLogarithmesProblemes";
import { calculerTotalPointsLogarithmesProblemes } from "../ui6e/formatLogarithmesProblemes";

interface Props {
  resultats: ResultatExerciceLogarithmesProblemes[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<ResultatExerciceLogarithmesProblemes["famille"], string> = {
  A: "A — Croissance/décroissance, résoudre pour t ou le taux",
  B: "B — Modèle à 2 points, extrapolation",
  C: "C — Radioactivité, demi-vie",
  D: "D — Asymptote non nulle",
  E: "E — Échelle logarithmique généralisée",
  F: "F — Courbe logistique généralisée",
  G: "G — Équilibre offre/demande",
};

/** Même patron que `ResumeSessionExponentiellesProblemes.tsx` (6gen12) : tableau récapitulatif de
 * TOUS les exercices de la session, jamais un score fractionnaire "X/100" comme SEULE information. */
export function ResumeSessionLogarithmesProblemes({ resultats, onRecommencer }: Props) {
  const moyennes = resultats.map((r) => {
    const { total, maximum } = calculerTotalPointsLogarithmesProblemes(r);
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
