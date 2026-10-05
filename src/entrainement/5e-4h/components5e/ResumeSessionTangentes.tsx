import type { ResultatExerciceTangente } from "../moteur5e/typesTangentes";

interface Props {
  resultats: ResultatExerciceTangente[];
  onRecommencer: () => void;
}

const LIBELLE_VARIANTE: Record<string, string> = {
  pointDonne: "A. Point donné",
  horizontale: "B. Horizontale",
  doubleTangence: "C. Double tangence",
};

function moyenneExercice(r: ResultatExerciceTangente): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionTangentes({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Variante</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LIBELLE_VARIANTE[r.exercice.variante]}</td>
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
