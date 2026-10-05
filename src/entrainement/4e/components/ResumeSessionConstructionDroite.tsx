import type { ResultatExerciceConstructionDroite } from "../moteur/typesConstructionDroite";
import { LIBELLE_FORME } from "../ui/formatEquationDroite";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceConstructionDroite[];
  onRecommencer: () => void;
}

function moyenneExercice(resultat: ResultatExerciceConstructionDroite): number {
  return (resultat.scorePoints + resultat.scoreTrace) / 2;
}

export function ResumeSessionConstructionDroite({ resultats, onRecommencer }: Props) {
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
            <th>Points</th>
            <th>Tracé</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_FORME[resultat.variante]}</td>
              <td>{formatScore(resultat.scorePoints)}</td>
              <td>{formatScore(resultat.scoreTrace)}</td>
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
