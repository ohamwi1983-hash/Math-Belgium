import { CATALOGUE_FAMILLES } from "../generateurs6e/graphiqueDeriveeLogarithme/index";
import type { ResultatExerciceGraphiqueDeriveeLogarithme } from "../moteur6e/typesGraphiqueDeriveeLogarithme";

interface Props {
  resultats: ResultatExerciceGraphiqueDeriveeLogarithme[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceGraphiqueDeriveeLogarithme): number {
  return (r.scoreDerivee + r.scoreSelection) / 2;
}

function labelFamille(famille: string): string {
  return CATALOGUE_FAMILLES.find((f) => f.id === famille)?.label ?? famille;
}

export function ResumeSessionGraphiqueDeriveeLogarithme({ resultats, onRecommencer }: Props) {
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
              <td>{labelFamille(r.exercice.famille)}</td>
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
