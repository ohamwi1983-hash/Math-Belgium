import type { ResultatExerciceSuiteArithmetique } from "../moteur5e/typesSuiteArithmetique";

interface Props {
  resultats: ResultatExerciceSuiteArithmetique[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<string, string> = {
  principal: "Pipeline u₁/r",
  coherence: "Vérification de cohérence",
  algebriqueTermeGeneral: "Isoler x (terme général)",
  algebriqueSommeSn: "Isoler x (somme Sₙ)",
  algebriqueRangN: "Isoler le rang n",
};

function libelleExercice(r: ResultatExerciceSuiteArithmetique): string {
  const base = LIBELLE_FAMILLE[r.exercice.famille];
  if (r.exercice.famille !== "principal") return base;
  return `${base} (${r.exercice.donnees.combo})`;
}

/** Moyenne — filtre les scores absents (`Partial<Record>`), jamais comptés comme 0. */
function moyenneExercice(r: ResultatExerciceSuiteArithmetique): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionSuiteArithmetique({ resultats, onRecommencer }: Props) {
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
