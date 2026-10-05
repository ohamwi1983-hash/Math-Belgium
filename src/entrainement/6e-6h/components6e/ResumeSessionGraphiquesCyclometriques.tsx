import { CATALOGUE_FAMILLES } from "../generateurs6e/graphiquesCyclometriques/index";
import type { ResultatExerciceGraphiquesCyclometriques } from "../moteur6e/typesGraphiquesCyclometriques";

interface Props {
  resultats: ResultatExerciceGraphiquesCyclometriques[];
  onRecommencer: () => void;
}

function labelFamille(famille: string): string {
  return CATALOGUE_FAMILLES.find((f) => f.id === famille)?.label ?? famille;
}

export function ResumeSessionGraphiquesCyclometriques({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + r.score, 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Famille</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{labelFamille(r.exercice.famille)}</td>
              <td>{Math.round(r.score)}/100</td>
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
