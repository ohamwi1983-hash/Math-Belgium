import type { ResultatExerciceComposerFonctions } from "../moteur5e/typesComposerFonctions";

interface Props {
  resultats: ResultatExerciceComposerFonctions[];
  onRecommencer: () => void;
}

/** Moyenne sur les phases RÉELLEMENT traversées (`r.scores`, `Partial<Record<...>>` — 2 à 10
 * valeurs selon `sens`/richesse des 2 directions, jamais un ensemble fixe). */
function moyenneExercice(r: ResultatExerciceComposerFonctions): number {
  const scores = Object.values(r.scores) as number[];
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function ResumeSessionComposerFonctions({ resultats, onRecommencer }: Props) {
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
