import type { ResultatExerciceEquationParabole } from "../moteur/typesEquationParabole";
import { LIBELLE_VARIANTE } from "../ui/formatEquationParabole";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceEquationParabole[];
  onRecommencer: () => void;
}

/** Les 2 scores sont toujours des `number` — moyenne directe sur `/2`, jamais de filtre `!== null`
 * nécessaire (même simplicité que "Équation d'un cercle... à partir d'un graphe"). */
function moyenneExercice(resultat: ResultatExerciceEquationParabole): number {
  return (resultat.scoreSommetFoyer + resultat.scoreEquation) / 2;
}

export function ResumeSessionEquationParabole({ resultats, onRecommencer }: Props) {
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
            <th>Sommet et foyer</th>
            <th>Équation</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
              <td>{formatScore(resultat.scoreSommetFoyer)}</td>
              <td>{formatScore(resultat.scoreEquation)}</td>
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
