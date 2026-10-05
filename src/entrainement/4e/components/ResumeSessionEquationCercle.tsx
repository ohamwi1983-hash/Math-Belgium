import type { ResultatExerciceEquationCercle } from "../moteur/typesEquationCercle";
import { LIBELLE_VARIANTE } from "../ui/formatEquationCercle";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceEquationCercle[];
  onRecommencer: () => void;
}

/** Les 3 scores sont toujours des `number` — moyenne directe sur `/3`, jamais de filtre `!== null`
 * nécessaire (même simplicité que "Relations entre droites"/"Construction graphique — tracer une
 * droite"). */
function moyenneExercice(resultat: ResultatExerciceEquationCercle): number {
  return (resultat.scoreCentre + resultat.scoreRayon + resultat.scoreEquation) / 3;
}

export function ResumeSessionEquationCercle({ resultats, onRecommencer }: Props) {
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
            <th>Centre</th>
            <th>Rayon</th>
            <th>Équation</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
              <td>{formatScore(resultat.scoreCentre)}</td>
              <td>{formatScore(resultat.scoreRayon)}</td>
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
