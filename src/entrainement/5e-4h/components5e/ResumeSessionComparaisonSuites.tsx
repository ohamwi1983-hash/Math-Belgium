import type { ResultatExerciceComparaisonSuites } from "../moteur5e/typesComparaisonSuites";
import { CATALOGUE_FAMILLES } from "../generateurs5e/comparaisonSuites/index";

interface Props {
  resultats: ResultatExerciceComparaisonSuites[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<string, string> = Object.fromEntries(CATALOGUE_FAMILLES.map((f) => [f.id, f.label]));

function moyenneExercice(r: ResultatExerciceComparaisonSuites): number {
  return (r.scoreTableau + r.scoreConclusion) / 2;
}

export function ResumeSessionComparaisonSuites({ resultats, onRecommencer }: Props) {
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
