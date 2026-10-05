import type { ResultatExerciceEquationsCyclometriques } from "../moteur6e/typesEquationsCyclometriques";

interface Props {
  resultats: ResultatExerciceEquationsCyclometriques[];
  onRecommencer: () => void;
}

const LIBELLE_VARIANTE: Record<ResultatExerciceEquationsCyclometriques["exercice"]["variante"], string> = {
  angleLineaire: "1. Angle linéaire",
  memeArcfonction: "2. Même arcfonction",
  angleQuadratique: "3. Angle quadratique",
  arcfonctionsDifferentes: "4. Arcfonctions différentes",
};

function libelle(r: ResultatExerciceEquationsCyclometriques): string {
  const base = LIBELLE_VARIANTE[r.exercice.variante];
  if (r.exercice.variante === "arcfonctionsDifferentes") return `${base} (${r.exercice.sousCas})`;
  return base;
}

function moyenneExercice(r: ResultatExerciceEquationsCyclometriques): number {
  const scores = [
    r.scoreCE,
    ...(r.scoreCondition !== null ? [r.scoreCondition] : []),
    r.scoreEquation,
    r.scoreSolutions,
    ...(r.scoreAcceptRejet !== null ? [r.scoreAcceptRejet] : []),
  ];
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function ResumeSessionEquationsCyclometriques({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Variante</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{libelle(r)}</td>
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
