import type { ResultatExerciceExtremaBornes } from "../moteur5e/typesExtremaBornes";

interface Props {
  resultats: ResultatExerciceExtremaBornes[];
  onRecommencer: () => void;
}

function libelleExercice(r: ResultatExerciceExtremaBornes): string {
  return `${r.exercice.contexte.grandeur} (${r.exercice.racinesFPrime.length} extrema, T=${r.exercice.T})`;
}

function moyenneExercice(r: ResultatExerciceExtremaBornes): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionExtremaBornes({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Contexte</th>
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
