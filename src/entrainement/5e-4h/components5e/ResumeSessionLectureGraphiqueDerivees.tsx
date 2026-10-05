import type { ResultatExerciceLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";

interface Props {
  resultats: ResultatExerciceLectureGraphiqueDerivees[];
  onRecommencer: () => void;
}

function libelleExercice(r: ResultatExerciceLectureGraphiqueDerivees): string {
  const { vas } = r.exercice.asymptotique;
  const nbExtrema = r.exercice.extrema.length;
  const nbPI = r.exercice.inflexions.length;
  return `${vas.length} AV — ${nbExtrema} extremum(s), ${nbPI} PI`;
}

function moyenneExercice(r: ResultatExerciceLectureGraphiqueDerivees): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionLectureGraphiqueDerivees({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Exercice</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{libelleExercice(r)}</td>
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
