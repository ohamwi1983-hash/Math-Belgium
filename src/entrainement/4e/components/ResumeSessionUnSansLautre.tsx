import type { ResultatExerciceUnSansLautre } from "../moteur/typesUnSansLautre";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceUnSansLautre[];
  onRecommencer: () => void;
}

function moyenneExercice(resultat: ResultatExerciceUnSansLautre): number {
  return (resultat.scoreCarre + resultat.scoreValeurSignee + resultat.scoreTangente) / 3;
}

const LIBELLE_FONCTION_CONNUE = { cos: "cos θ donné", sin: "sin θ donné" } as const;

export function ResumeSessionUnSansLautre({ resultats, onRecommencer }: Props) {
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
            <th>Donné</th>
            <th>Carré</th>
            <th>Valeur signée</th>
            <th>Tangente</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{LIBELLE_FONCTION_CONNUE[resultat.fonctionConnue]}</td>
              <td>{formatScore(resultat.scoreCarre)}</td>
              <td>{formatScore(resultat.scoreValeurSignee)}</td>
              <td>{formatScore(resultat.scoreTangente)}</td>
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
