import type { ResultatExerciceDeriveesCyclometriques } from "../moteur6e/typesDeriveesCyclometriques";

interface Props {
  resultats: ResultatExerciceDeriveesCyclometriques[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<ResultatExerciceDeriveesCyclometriques["famille"], string> = {
  A: "A — Application directe",
  B: "B — Règle du produit",
  C: "C — Quotient sans identité",
  D: "D — Quotient avec identité",
  E: "E — Composition imbriquée",
  F: "F — Composition + identité trig.",
  G: "G — Réciproque vs fraction",
};

function moyenne(r: ResultatExerciceDeriveesCyclometriques): number {
  switch (r.famille) {
    case "A":
      return (r.scoreDeriveeU + r.scoreDeriveeFinale) / 2;
    case "B":
      return (r.scoreDeriveeU + r.scoreDeriveeArc + r.scoreDeriveeFinale) / 3;
    case "C":
      return (r.scoreNumerateur + r.scoreDenominateur + r.scoreDeriveeFinale) / 3;
    case "D":
      return (r.scoreNumerateur + r.scoreDenominateur + r.scoreBrut + r.scoreSimplifiee) / 4;
    case "E":
      return (r.scoreDeriveeInterne + r.scoreDeriveeFinale) / 2;
    case "F":
      return (r.scoreBrute + r.scoreSimplifiee) / 2;
    case "G":
      return (r.scoreDeriveeInterne + r.scoreDeriveeFinale) / 2;
  }
}

export function ResumeSessionDeriveesCyclometriques({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenne(r), 0) / resultats.length;
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
              <td>{Math.round(moyenne(r))}/100</td>
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
