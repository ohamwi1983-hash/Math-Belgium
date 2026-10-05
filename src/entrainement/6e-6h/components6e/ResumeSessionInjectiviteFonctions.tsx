import { CATALOGUE_FAMILLES } from "../generateurs6e/injectiviteFonctions/index";
import type { ResultatExerciceInjectiviteFonctions } from "../moteur6e/typesInjectiviteFonctions";

interface Props {
  resultats: ResultatExerciceInjectiviteFonctions[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceInjectiviteFonctions): number {
  return (r.scoreDomaine + r.scoreInjective + r.scoreReciproque + r.scoreImage + r.scoreBijection) / 5;
}

function labelFamille(famille: string): string {
  return CATALOGUE_FAMILLES.find((f) => f.id === famille)?.label ?? famille;
}

export function ResumeSessionInjectiviteFonctions({ resultats, onRecommencer }: Props) {
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
              <td>{labelFamille(r.exercice.parametres.famille)}</td>
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
