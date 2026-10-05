import type { ResultatExerciceEquationExponentielle } from "../moteur6e/typesEquationsExponentielles";

interface Props {
  resultats: ResultatExerciceEquationExponentielle[];
  onRecommencer: () => void;
}

const LIBELLE_STYLE_C: Record<string, string> = { direct: "direct", carreDeguise: "base² déguisée", regroupement: "regroupement" };

function libelleExercice(r: ResultatExerciceEquationExponentielle): string {
  switch (r.exercice.famille) {
    case "A":
      return `A${r.exercice.sousType.slice(1)} — même base`;
    case "B":
      return "B — √(baseᵘ)=baseᵛ";
    case "C":
      return `C — changement de variable (${LIBELLE_STYLE_C[r.exercice.style]})`;
    case "D":
      return `D${r.exercice.sousType.slice(1)} — ∅ par construction`;
  }
}

function moyenneExercice(r: ResultatExerciceEquationExponentielle): number {
  switch (r.famille) {
    case "A":
    case "B":
      return (r.scoreEcran1 + r.scoreEcran2) / 2;
    case "C":
      return (r.scoreEcran1 + r.scoreEcran2 + r.scoreEcran3) / 3;
    case "D":
      return r.score;
  }
}

export function ResumeSessionEquationExponentielle({ resultats, onRecommencer }: Props) {
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
