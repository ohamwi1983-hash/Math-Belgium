import type { ResultatExerciceInequationExponentielle } from "../moteur6e/typesInequationsExponentielles";

interface Props {
  resultats: ResultatExerciceInequationExponentielle[];
  onRecommencer: () => void;
}

function libelleExercice(r: ResultatExerciceInequationExponentielle): string {
  switch (r.famille) {
    case "A":
      return "A — même base";
    case "B":
      return "B — toujours ∅";
    case "C":
      return r.sousType === "f" ? "C — toujours ℝ (produit de signes)" : "C — toujours ℝ (regroupement)";
    case "D":
      return r.sousType === "constant" ? "D — 1 facteur à signe constant" : "D — 2 facteurs variables (tableau)";
    case "E":
      return "E — bases différentes";
  }
}

function moyenneExercice(r: ResultatExerciceInequationExponentielle): number {
  switch (r.famille) {
    case "A":
      return (r.scoreReconnaitre + r.scoreResoudre) / 2;
    case "B":
      return r.score;
    case "C":
      return r.sousType === "f" ? r.score : (r.scoreRegrouper + r.scoreConclure) / 2;
    case "D":
      return r.sousType === "constant" ? (r.scoreSigne + r.scoreResoudre) / 2 : (r.scoreSigne1 + r.scoreSigne2 + r.scoreTableau) / 3;
    case "E":
      return (r.scoreRegrouper + r.scoreResoudre) / 2;
  }
}

export function ResumeSessionInequationExponentielle({ resultats, onRecommencer }: Props) {
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
