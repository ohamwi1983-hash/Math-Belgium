import type { ResultatExerciceSuiteRecurrenteAffine } from "../moteur5e/typesSuiteRecurrenteAffine";

interface Props {
  resultats: ResultatExerciceSuiteRecurrenteAffine[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceSuiteRecurrenteAffine): number {
  return (r.scorePoserRecurrence + r.scoreRegimePermanent + r.scoreTermesSuccessifs) / 3;
}

export function ResumeSessionSuiteRecurrenteAffine({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Régime</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r.exercice.regime === "convergent" ? "Convergent" : "Divergent"}</td>
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
