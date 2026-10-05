import type { ResultatExerciceAssociation } from "../moteur5e/typesAssociation";

interface Props {
  resultats: ResultatExerciceAssociation[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<string, string> = {
  grapheDerivee: "A — Graphe f ↔ graphe f'",
  grapheVerbal: "B — Graphe f ↔ énoncé verbal",
  symbolique: "C — f ↔ f' symbolique",
};

export function ResumeSessionAssociation({ resultats, onRecommencer }: Props) {
  const moyenne = resultats.reduce((a, r) => a + r.score, 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Famille</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LIBELLE_FAMILLE[r.exercice.famille]}</td>
              <td>{Math.round(r.score)}/100</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Moyenne générale : {Math.round(moyenne)}/100</p>
      <button type="button" className="btn btn-primary" onClick={onRecommencer}>
        Recommencer
      </button>
    </div>
  );
}
