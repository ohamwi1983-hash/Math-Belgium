import type { ResultatExerciceParametresSinusoide } from "../moteur5e/typesParametresSinusoide";

interface Props {
  resultats: ResultatExerciceParametresSinusoide[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceParametresSinusoide): number {
  return (r.scoreAmplitude + r.scorePhi + r.scorePeriode + r.scoreFrequence + r.scoreDecalage) / 5;
}

export function ResumeSessionParametresSinusoide({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Forme</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r.exercice.forme === "developpee" ? "Développée" : "Pré-factorisée"}</td>
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
