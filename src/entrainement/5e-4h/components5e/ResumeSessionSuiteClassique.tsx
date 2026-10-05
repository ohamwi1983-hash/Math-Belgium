import type { ResultatExerciceSuiteClassique } from "../moteur5e/typesSuiteClassique";
import { CATALOGUE_SCENARIOS } from "../generateurs5e/suitesClassiques/index";

interface Props {
  resultats: ResultatExerciceSuiteClassique[];
  onRecommencer: () => void;
}

const LIBELLE_SCENARIO: Record<string, string> = Object.fromEntries(CATALOGUE_SCENARIOS.map((s) => [s.id, s.label]));

/** Moyenne — filtre les scores absents (`Partial<Record>`), jamais comptés comme 0. */
function moyenneExercice(r: ResultatExerciceSuiteClassique): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionSuiteClassique({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Scénario</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LIBELLE_SCENARIO[r.exercice.scenario]}</td>
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
