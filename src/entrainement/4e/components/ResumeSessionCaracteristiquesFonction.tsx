import type { ResultatExerciceCaracteristiquesFonction } from "../moteur/typesCaracteristiquesFonction";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceCaracteristiquesFonction[];
  onRecommencer: () => void;
}

function moyenneExercice(resultat: ResultatExerciceCaracteristiquesFonction): number {
  return (
    (resultat.scoreDomaine +
      resultat.scoreZeros +
      resultat.scoreCroissance +
      resultat.scoreDecroissance +
      resultat.scoreConstance +
      resultat.scoreOrdonnee +
      resultat.scoreValeur +
      resultat.scoreAsymptotes) /
    8
  );
}

export function ResumeSessionCaracteristiquesFonction({ resultats, onRecommencer }: Props) {
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
            <th>Domaine</th>
            <th>Zéros</th>
            <th>Croissance</th>
            <th>Décroissance</th>
            <th>Constance</th>
            <th>f(0)</th>
            <th>f(v)</th>
            <th>Asymptotes</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{formatScore(resultat.scoreDomaine)}</td>
              <td>{formatScore(resultat.scoreZeros)}</td>
              <td>{formatScore(resultat.scoreCroissance)}</td>
              <td>{formatScore(resultat.scoreDecroissance)}</td>
              <td>{formatScore(resultat.scoreConstance)}</td>
              <td>{formatScore(resultat.scoreOrdonnee)}</td>
              <td>{formatScore(resultat.scoreValeur)}</td>
              <td>{formatScore(resultat.scoreAsymptotes)}</td>
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
