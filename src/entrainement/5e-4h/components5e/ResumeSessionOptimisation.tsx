import type { ResultatExerciceOptimisation } from "../moteur5e/typesOptimisationGeometrique";

interface Props {
  resultats: ResultatExerciceOptimisation[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<string, string> = {
  trapeze: "A. Trapèze isocèle",
  cylindre: "B. Cylindre",
  margesA: "C(a). Marges — maximiser l'aire imprimée",
  margesB: "C(b). Marges — minimiser l'aire totale",
  fenetreA: "D(a). Fenêtre — maximiser l'aire",
  fenetreB: "D(b). Fenêtre — minimiser le périmètre",
  cubique: "Bonus. Reconstruction cubique",
};

function moyenneExercice(r: ResultatExerciceOptimisation): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionOptimisation({ resultats, onRecommencer }: Props) {
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
