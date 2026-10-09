import type { ResultatExerciceDomaineDeriveeLogarithme } from "../moteur6e/typesDomaineDeriveeLogarithme";

interface Props {
  resultats: ResultatExerciceDomaineDeriveeLogarithme[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<ResultatExerciceDomaineDeriveeLogarithme["famille"], string> = {
  A: "A — Application directe",
  B: "B — Domaine via racine/quadratique",
  C: "C — Produit avec terme logarithmique",
  D: "D — Quotient avec terme logarithmique",
  E: "E — Simplifier avant de dériver",
  F: "F — Synthèse transversale",
  G: "G — Dérivation logarithmique implicite",
};

function moyenneExercice(r: ResultatExerciceDomaineDeriveeLogarithme): number {
  switch (r.famille) {
    case "A":
    case "B":
    case "F":
      return (r.scoreDomaine + r.scoreDerivee) / 2;
    case "C":
      return (r.scoreDomaine + r.scoreFacteurs + r.scoreAssemblage) / 3;
    case "D":
      return (r.scoreDomaine + r.scoreND + r.scoreAssemblage) / 3;
    case "E":
      return (r.scoreDomaine + r.scoreSimplifier + r.scoreDerivee) / 3;
    case "G":
      return (r.scoreIdentifier + r.scoreFPrimeSurF + r.scoreIsoler) / 3;
  }
}

export function ResumeSessionDomaineDeriveeLogarithme({ resultats, onRecommencer }: Props) {
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
