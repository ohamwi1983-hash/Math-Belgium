import type { ResultatExerciceLimiteLogarithmique } from "../moteur6e/typesLimitesLogarithmiques";

interface Props {
  resultats: ResultatExerciceLimiteLogarithmique[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<ResultatExerciceLimiteLogarithmique["famille"], string> = {
  A: "A — Croissances comparées",
  B: "B — 0/0 via ln(1+u)/u",
  C: "C — Limites déterminées (parfois déguisées)",
  D: "D — Forme 1^∞",
  E: "E — Cas avancé",
};

function moyenneExercice(r: ResultatExerciceLimiteLogarithmique): number {
  switch (r.famille) {
    case "A":
      return (r.scoreDominance + r.scoreConclure) / 2;
    case "B":
      return (r.scoreReformuler + r.scoreConclure) / 2;
    case "C":
      return (r.scoreDiagnostic + r.scoreConclure) / 2;
    case "D":
      return (r.scoreExposant + r.scoreLimiteExposant + r.scoreConclure) / 3;
    case "E":
      return (r.scoreDevelopper + r.scoreSimplifier + r.scoreConclure) / 3;
  }
}

export function ResumeSessionLimitesLogarithmiques({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Famille</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LIBELLE_FAMILLE[r.famille]}</td>
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
