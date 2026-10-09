import type { ResultatExerciceDenombrementCombinatoirePur } from "../moteur6e/typesDenombrementCombinatoirePur";
import { LIBELLE_FAMILLE, calculerTotalPointsDenombrementCombinatoirePur } from "../ui6e/formatDenombrementCombinatoirePur";

interface Props {
  resultats: ResultatExerciceDenombrementCombinatoirePur[];
  onRecommencer: () => void;
}

/** Résumé de session — mêmes conventions que `ResumeSessionDenombrementFondamental.tsx` (6gen43) /
 * `ResumeSessionDenombrementCombine.tsx` (6gen44) : une moyenne (jamais un score fractionnaire
 * "X/100" isolé) par exercice, réutilisant les scores RÉELS déjà calculés par
 * `calculerTotalPointsDenombrementCombinatoirePur`. */
export function ResumeSessionDenombrementCombinatoirePur({ resultats, onRecommencer }: Props) {
  const moyennes = resultats.map((r) => {
    const { total, maximum } = calculerTotalPointsDenombrementCombinatoirePur(r);
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
              <td>{LIBELLE_FAMILLE[r.exercice.famille]}</td>
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
