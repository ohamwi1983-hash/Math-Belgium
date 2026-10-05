import type { ResultatExerciceDomaineDefinition } from "../moteur5e/typesDomaineDefinition";

interface Props {
  resultats: ResultatExerciceDomaineDefinition[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceDomaineDefinition): number {
  const scores = [r.scoreCE, r.scoreResolution, r.scoreDomf].filter((s): s is number => s !== null);
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function ResumeSessionDomaineDefinition({ resultats, onRecommencer }: Props) {
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
              <td>{r.exercice.famille}</td>
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
