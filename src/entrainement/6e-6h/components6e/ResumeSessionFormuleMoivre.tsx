import type { ResultatExerciceFormuleMoivre } from "../moteur6e/typesFormuleMoivre";
import { calculerTotalPointsFormuleMoivre, libelleExercice } from "../ui6e/formatFormuleMoivre";

interface Props {
  resultats: ResultatExerciceFormuleMoivre[];
  onRecommencer: () => void;
}

/** Résumé de session — mêmes conventions que `ResumeSessionNombresComplexes.tsx` (6gen34) : une
 * moyenne (jamais un score fractionnaire "X/100" isolé) par exercice, réutilisant les scores RÉELS
 * déjà calculés par `calculerTotalPointsFormuleMoivre`. Colonne "Exercice" affiche `n` (UNE seule
 * famille ici, contrairement à 6gen34 — pas de `LIBELLE_FAMILLE`). */
export function ResumeSessionFormuleMoivre({ resultats, onRecommencer }: Props) {
  const moyennes = resultats.map((r) => {
    const { total, maximum } = calculerTotalPointsFormuleMoivre(r);
    return (total / maximum) * 100;
  });
  const moyenneGenerale = moyennes.reduce((a, m) => a + m, 0) / moyennes.length;

  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Exercice</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{libelleExercice(r.exercice)}</td>
              <td>{Math.round(moyennes[i])}/100</td>
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
