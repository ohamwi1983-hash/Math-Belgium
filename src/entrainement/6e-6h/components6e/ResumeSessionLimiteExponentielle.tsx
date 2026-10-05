import type { ResultatExerciceLimiteExponentielle } from "../moteur6e/typesLimitesExponentielles";

interface Props {
  resultats: ResultatExerciceLimiteExponentielle[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<ResultatExerciceLimiteExponentielle["famille"], string> = {
  A: "A — Limite directe",
  B: "B — Somme, terme dominant",
  C: "C — Produit, FI ∞·0",
  G: "G — ∞−∞ avancée",
  H: "H — L'Hôpital, 0/0 exponentiel",
  I: "I — L'Hôpital, 0/0 mixte trigonométrique",
  J: "J — L'Hôpital, 0/0 mixte arcfonction",
  K: "K — L'Hôpital, deux applications",
  L: "L — FI 1^∞ via pivot e",
  N: "N — FI ∞^0/0^0 via loi des puissances",
};

function moyenneExercice(r: ResultatExerciceLimiteExponentielle): number {
  switch (r.famille) {
    case "A":
      return (r.scoreExposant + r.scoreGlobale) / 2;
    case "B":
      return (r.scoreExponentielle + r.scorePolynomiale + r.scoreGlobale) / 3;
    case "C":
      return (r.scoreFacteurs + r.scoreGlobale) / 2;
    case "G":
      return (r.scoreCombiner + r.scoreOrdre1 + r.scoreConclure) / 3;
    case "H":
    case "I":
    case "J":
      return (r.scoreForme + r.scoreNumerateur + r.scoreDenominateur + r.scoreConclure) / 4;
    case "K":
      return (r.scoreForme + r.scoreNumerateur1 + r.scoreDenominateur1 + r.scoreNumerateur2 + r.scoreDenominateur2 + r.scoreConclure) / 6;
    case "L":
      return (r.scoreReformuler + r.scoreConclure) / 2;
    case "N":
      return (r.scoreCombiner + r.scoreConclure) / 2;
  }
}

export function ResumeSessionLimiteExponentielle({ resultats, onRecommencer }: Props) {
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
