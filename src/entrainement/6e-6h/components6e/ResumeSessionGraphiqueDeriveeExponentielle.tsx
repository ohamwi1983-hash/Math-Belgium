import { CATALOGUE_FAMILLES } from "../generateurs6e/graphiquesDeriveeExponentielles/index";
import type { ResultatExerciceGraphiqueDeriveeExponentielle } from "../moteur6e/typesGraphiquesDeriveeExponentielles";

interface Props {
  resultats: ResultatExerciceGraphiqueDeriveeExponentielle[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceGraphiqueDeriveeExponentielle): number {
  return r.scoreDerivee === null ? r.scoreSelection : (r.scoreDerivee + r.scoreSelection) / 2;
}

function labelFamille(famille: string): string {
  return CATALOGUE_FAMILLES.find((f) => f.id === famille)?.label ?? famille;
}

export function ResumeSessionGraphiqueDeriveeExponentielle({ resultats, onRecommencer }: Props) {
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
