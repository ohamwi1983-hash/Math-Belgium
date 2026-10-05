import type { ResultatExerciceConvergenceSuite } from "../moteur5e/typesConvergenceSuites";

interface Props {
  resultats: ResultatExerciceConvergenceSuite[];
  onRecommencer: () => void;
}

const LIBELLE_VARIANTE: Record<string, string> = {
  arithmetique: "Suite arithmétique",
  geometrique: "Suite géométrique",
  quelconque: "Suite rationnelle P(n)/Q(n)",
};

function moyenneExercice(r: ResultatExerciceConvergenceSuite): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionConvergenceSuites({ resultats, onRecommencer }: Props) {
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
              <td>{LIBELLE_VARIANTE[r.exercice.variante]}</td>
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
