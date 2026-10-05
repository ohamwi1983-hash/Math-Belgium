import type { ResultatExerciceLimite } from "../moteur5e/typesLimites";
import { LIBELLE_FAMILLE_LIMITE } from "../ui5e/formatLimites";

interface Props {
  resultats: ResultatExerciceLimite[];
  onRecommencer: () => void;
}

function libelleExercice(r: ResultatExerciceLimite): string {
  const base = LIBELLE_FAMILLE_LIMITE[r.exercice.famille];
  if (r.exercice.famille === "limiteInfiniePoint") return `${base} (${r.exercice.sousCas})`;
  if (r.exercice.famille === "limiteInfini") return `${base} (${r.exercice.sousCas})`;
  return base;
}

/** Moyenne — filtre les scores absents (`Partial<Record>`), jamais comptés comme 0. */
function moyenneExercice(r: ResultatExerciceLimite): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionLimite({ resultats, onRecommencer }: Props) {
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
