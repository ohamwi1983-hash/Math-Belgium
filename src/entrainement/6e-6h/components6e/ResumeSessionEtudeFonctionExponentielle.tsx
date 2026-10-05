import type { ResultatExerciceEtudeFonctionExponentielle } from "../moteur6e/typesEtudeFonctionExponentielle";

interface Props {
  resultats: ResultatExerciceEtudeFonctionExponentielle[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<string, string> = {
  A: "A — e^(mx+n)",
  B: "B — point exclu",
  C: "C — asymptote oblique",
  D: "D — a·x·eˣ",
};

function moyenneExercice(r: ResultatExerciceEtudeFonctionExponentielle): number {
  return (r.scoreDomaine + r.scoreLimites + r.scoreAsymptotes + r.scoreCroissance + r.scoreConcavite + r.scoreGraphique) / 6;
}

export function ResumeSessionEtudeFonctionExponentielle({ resultats, onRecommencer }: Props) {
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
              <td>{LIBELLE_FAMILLE[r.exercice.famille]}</td>
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
