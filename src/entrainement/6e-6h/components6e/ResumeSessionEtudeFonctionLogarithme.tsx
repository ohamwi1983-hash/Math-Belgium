import type { ResultatExerciceEtudeFonctionLogarithme } from "../moteur6e/typesEtudeFonctionLogarithme";
import { totalPointsRecap } from "../ui6e/formatEtudeFonctionLogarithme";

interface Props {
  resultats: ResultatExerciceEtudeFonctionLogarithme[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<string, string> = {
  A: "A — x^(ax)",
  B: "B — x^(k/x)",
  C: "C — ln|k²-x²|",
  D: "D — x+c·e^(-x)",
  E: "E — oscillation amortie/amplifiée",
};

/** Moyenne sur 100 — le `maximum` par exercice varie selon la famille (600 pour A-D, 200 pour E),
 * `totalPointsRecap` le renvoie déjà correctement par exercice. */
function moyenneExercice(r: ResultatExerciceEtudeFonctionLogarithme): number {
  const { total, maximum } = totalPointsRecap(r);
  return (total / maximum) * 100;
}

export function ResumeSessionEtudeFonctionLogarithme({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Famille</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LIBELLE_FAMILLE[r.exercice.famille]}</td>
              <td>{Math.round(moyenneExercice(r))}/100</td>
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
