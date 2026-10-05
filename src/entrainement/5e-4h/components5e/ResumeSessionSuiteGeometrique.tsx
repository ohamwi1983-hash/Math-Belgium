import type { ResultatExerciceSuiteGeometrique } from "../moteur5e/typesSuiteGeometrique";

interface Props {
  resultats: ResultatExerciceSuiteGeometrique[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<string, string> = {
  principal: "Pipeline u₁/q",
  algebriqueTermeGeneral: "Isoler x — via uₚ et uₙ",
  algebriqueSommeSn: "Isoler x — Sn",
  algebriqueRangN: "Isoler le rang n",
};

function libelleExercice(r: ResultatExerciceSuiteGeometrique): string {
  const base = LIBELLE_FAMILLE[r.exercice.famille];
  if (r.exercice.famille === "principal") {
    return `${base} (${r.exercice.donnees.combo}${r.exercice.statutQ === "double" ? ", 2 suites" : ""})`;
  }
  if (r.exercice.famille === "algebriqueSommeSn") return `${base} (sous-cas ${r.exercice.sousCas})`;
  return base;
}

/** Moyenne — filtre les scores absents (`Partial<Record>`), jamais comptés comme 0. */
function moyenneExercice(r: ResultatExerciceSuiteGeometrique): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionSuiteGeometrique({ resultats, onRecommencer }: Props) {
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
