import type { ResultatExerciceFonctionsCyclometriques } from "../moteur6e/typesFonctionsCyclometriques";

interface Props {
  resultats: ResultatExerciceFonctionsCyclometriques[];
  onRecommencer: () => void;
}

const LABEL_VARIANTE: Record<string, string> = { directe: "Directe", arcTrig: "arcfonction(trig)", trigArc: "trig(arcfonction)" };

export function ResumeSessionFonctionsCyclometriques({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + r.score, 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Variante</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LABEL_VARIANTE[r.exercice.variante]}</td>
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
