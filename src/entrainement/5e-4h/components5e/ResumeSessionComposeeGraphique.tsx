import type { ResultatExerciceComposeeGraphique } from "../moteur5e/typesComposeeGraphique";

interface Props {
  resultats: ResultatExerciceComposeeGraphique[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceComposeeGraphique): number {
  return r.resultatsQuestions.reduce((a, q) => a + q.score, 0) / r.resultatsQuestions.length;
}

export function ResumeSessionComposeeGraphique({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Questions</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r.resultatsQuestions.length}</td>
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
