import type { ResultatExerciceLectureGraphiqueLimites } from "../moteur5e/typesLectureGraphiqueLimites";

interface Props {
  resultats: ResultatExerciceLectureGraphiqueLimites[];
  onRecommencer: () => void;
}

const LIBELLE_INFINI: Record<string, string> = { horizontale: "horizontale", oblique: "oblique", aucune: "aucune" };

function libelleExercice(r: ResultatExerciceLectureGraphiqueLimites): string {
  return `${r.exercice.vas.length} AV — ${LIBELLE_INFINI[r.exercice.infini.type]}`;
}

function moyenneExercice(r: ResultatExerciceLectureGraphiqueLimites): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionLectureGraphiqueLimites({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Exercice</th>
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
