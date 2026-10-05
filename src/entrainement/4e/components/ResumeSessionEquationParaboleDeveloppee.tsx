import type { ResultatExerciceEquationParaboleDeveloppee } from "../moteur/typesEquationParaboleDeveloppee";
import { LIBELLE_VARIANTE } from "../ui/formatEquationParaboleDeveloppee";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceEquationParaboleDeveloppee[];
  onRecommencer: () => void;
}

/** Les 3 scores sont toujours des `number` — moyenne directe sur `/3`, jamais de filtre `!== null`
 * nécessaire (même simplicité que "Centre et rayon d'un cercle depuis l'équation développée"). */
function moyenneExercice(resultat: ResultatExerciceEquationParaboleDeveloppee): number {
  return (resultat.scoreRegroupement + resultat.scoreCompletion + resultat.scoreCaracteristiques) / 3;
}

export function ResumeSessionEquationParaboleDeveloppee({ resultats, onRecommencer }: Props) {
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
            <th>Caractéristiques</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
              <td>{formatScore(resultat.scoreRegroupement)}</td>
              <td>{formatScore(resultat.scoreCompletion)}</td>
              <td>{formatScore(resultat.scoreCaracteristiques)}</td>
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
