import type { ResultatExerciceInequationLogarithmique } from "../moteur6e/typesInequationsLogarithmiques";

interface Props {
  resultats: ResultatExerciceInequationLogarithmique[];
  onRecommencer: () => void;
}

function libelleExercice(r: ResultatExerciceInequationLogarithmique): string {
  switch (r.famille) {
    case "A":
      return "A — log_base(u) R constante";
    case "B": {
      const exercice = r.exercice;
      const sousType = exercice.famille === "B" ? exercice.sousType : "direct";
      return sousType === "racine" ? "B — comparaison directe (avec racine)" : "B — comparaison directe (affine)";
    }
    case "C": {
      const exercice = r.exercice;
      const sousType = exercice.famille === "C" ? exercice.sousType : "produit";
      return sousType === "quotient" ? "C — combiner en quotient" : "C — combiner en produit";
    }
    case "D":
      return "D — quadratique en y=log_base(x)";
    case "E":
      return "E — domaine vide par construction";
    case "F":
      return "F — base paramétrique, split a>1/0<a<1";
  }
}

function moyenneExercice(r: ResultatExerciceInequationLogarithmique): number {
  switch (r.famille) {
    case "A":
      return (r.scoreCE + r.scoreResoudre) / 2;
    case "B":
      return (r.scoreCE + r.scoreResoudre) / 2;
    case "C":
      return (r.scoreCE + r.scoreCombiner + r.scoreComparer) / 3;
    case "D":
      return (r.scoreCE + r.scoreReecrire + r.scoreResoudreY + r.scoreConvertirX) / 4;
    case "E":
      return r.score;
    case "F":
      return (r.scoreCE + r.scoreSimplifier + r.scoreConclure) / 3;
  }
}

export function ResumeSessionInequationLogarithmique({ resultats, onRecommencer }: Props) {
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
