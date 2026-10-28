import type { ResultatExerciceEtudierFonction } from "../moteur5e/typesEtudierFonction";

interface Props {
  resultats: ResultatExerciceEtudierFonction[];
  onRecommencer: () => void;
}

function libelleExercice(r: ResultatExerciceEtudierFonction): string {
  if (r.exercice.famille === "rationnelleAO") return "Rationnelle — asymptote oblique";
  const LIBELLE_TYPE: Record<string, string> = { polynomiale: "Polynomiale", rationnelleSansCE: "Rationnelle sans CE", rationnelleAvecCE: "Rationnelle avec CE" };
  return LIBELLE_TYPE[r.exercice.noyau.type];
}

export function ResumeSessionEtudierFonction({ resultats, onRecommencer }: Props) {
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{libelleExercice(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn btn-primary" onClick={onRecommencer}>
        Recommencer
      </button>
    </div>
  );
}
