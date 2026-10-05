import type { ResultatExerciceParametresSinusoideGraphique } from "../moteur5e/typesParametresSinusoideGraphique";

interface Props {
  resultats: ResultatExerciceParametresSinusoideGraphique[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceParametresSinusoideGraphique): number {
  return (r.scoreDecalage + r.scoreAmplitude + r.scorePeriode + r.scoreFrequence + r.scorePhi) / 5;
}

export function ResumeSessionParametresSinusoideGraphique({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
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
