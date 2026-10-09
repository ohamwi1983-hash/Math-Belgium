import type { ResultatExerciceHyperboliques } from "../moteur6e/typesHyperboliques";
import { totalPointsHyperboliques } from "../ui6e/formatHyperboliques";

interface Props {
  resultats: ResultatExerciceHyperboliques[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<ResultatExerciceHyperboliques["famille"], string> = {
  A: "A — Parité de combinaisons",
  B: "B — Identité ch²−sh²=1",
  C: "C — Dérivée et dérivée seconde",
  D: "D — Limites en ±∞",
};

function pourcentageExercice(r: ResultatExerciceHyperboliques): number {
  const total = totalPointsHyperboliques(r);
  return (100 * total.points) / total.maximum;
}

/** Résumé de fin de session — même structure que `ResumeSessionDomaineDeriveeLogarithme.tsx`
 * (`6gen16`) : un tableau, une ligne par exercice, moyenne générale sur 100 (chaque exercice
 * ramené sur 100 malgré un nombre d'écrans différent selon la famille). */
export function ResumeSessionHyperboliques({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + pourcentageExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Famille</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LIBELLE_FAMILLE[r.famille]}</td>
              <td>{Math.round(pourcentageExercice(r))}/100</td>
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
