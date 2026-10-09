import type { ResultatExerciceProprietesLogarithme } from "../moteur6e/typesProprietesLogarithme";
import { calculerTotalPointsProprietesLogarithme } from "../ui6e/formatProprietesLogarithme";

interface Props {
  resultats: ResultatExerciceProprietesLogarithme[];
  onRecommencer: () => void;
}

/** Même patron que `ResumeSessionFonctionsCyclometriques.tsx` (6gen2) : tableau récapitulatif de
 * TOUS les exercices de la session, une moyenne par exercice (jamais un score fractionnaire
 * "X/100" comme SEULE information — voir CLAUDE.md), réutilisant les scores RÉELS déjà calculés par
 * `calculerTotalPointsProprietesLogarithme`. */
export function ResumeSessionProprietesLogarithme({ resultats, onRecommencer }: Props) {
  const moyennes = resultats.map((r) => {
    const { total, maximum } = calculerTotalPointsProprietesLogarithme(r);
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
          {resultats.map((_r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>Propriétés du logarithme</td>
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
