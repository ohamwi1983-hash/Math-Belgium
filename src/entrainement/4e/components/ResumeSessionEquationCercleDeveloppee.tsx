import type { ResultatExerciceEquationCercleDeveloppee } from "../moteur/typesEquationCercleDeveloppee";
import { LIBELLE_VARIANTE } from "../ui/formatEquationCercleDeveloppee";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceEquationCercleDeveloppee[];
  onRecommencer: () => void;
}

/** Les 3 scores sont toujours des `number` — moyenne directe sur `/3`, jamais de filtre `!== null`
 * nécessaire (même simplicité que "Équation d'un cercle... à partir d'un graphe"). */
function moyenneExercice(resultat: ResultatExerciceEquationCercleDeveloppee): number {
  return (resultat.scoreRegroupement + resultat.scoreCompletion + resultat.scoreCentreRayon) / 3;
}

export function ResumeSessionEquationCercleDeveloppee({ resultats, onRecommencer }: Props) {
  const moyenne = resultats.reduce((somme, r) => somme + moyenneExercice(r), 0) / resultats.length;

  return (
    <div>
      <h2 className="result-title">Session terminée</h2>
      <p className="result-subtitle">{resultats.length} exercices complétés</p>
      <div className="score-hero">
        <div className="score-hero-value">{moyenne.toFixed(0)}/100</div>
        <div className="score-hero-label">score moyen</div>
      </div>
      <table className="summary-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Variante</th>
            <th>Regroupement</th>
            <th>Complétion</th>
            <th>Centre et rayon</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
              <td>{formatScore(resultat.scoreRegroupement)}</td>
              <td>{formatScore(resultat.scoreCompletion)}</td>
              <td>{formatScore(resultat.scoreCentreRayon)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn btn-primary" onClick={onRecommencer}>
        Recommencer
      </button>
    </div>
  );
}
