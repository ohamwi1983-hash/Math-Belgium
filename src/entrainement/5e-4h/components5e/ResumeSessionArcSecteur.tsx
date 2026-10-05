import type { ResultatExerciceArcSecteur } from "../moteur5e/typesArcsSecteurs";

interface Props {
  resultats: ResultatExerciceArcSecteur[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceArcSecteur): number {
  if (r.mode === "conversion") return r.score;
  const scores = Object.values(r.scores) as number[];
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function ResumeSessionArcSecteur({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Mode</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r.mode === "conversion" ? "Conversion" : "2 données → 3 inconnues"}</td>
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
