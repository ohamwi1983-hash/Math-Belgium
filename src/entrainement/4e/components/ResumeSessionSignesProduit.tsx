import type { ResultatExerciceSignesProduit } from "../moteur/typesSignesProduit";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceSignesProduit[];
  onRecommencer: () => void;
}

function scoresPresents(resultat: ResultatExerciceSignesProduit): number[] {
  return [
    ...resultat.scoresRacineLineaire,
    resultat.scoreReductionFacteur,
    ...resultat.scoresMethode,
    resultat.scoreFactorisationChamp1,
    resultat.scoreFactorisationChamp2,
    resultat.scoreFactorisationFactorisation,
    ...resultat.scoresSigneIrreductible,
    resultat.scoreGrille,
    resultat.scoreIntervalle,
  ].filter((score): score is number => score !== null);
}

function moyenneExercice(resultat: ResultatExerciceSignesProduit): number {
  const scores = scoresPresents(resultat);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionSignesProduit({ resultats, onRecommencer }: Props) {
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
            <th>Tableau</th>
            <th>Intervalle</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{formatScore(resultat.scoreGrille)}</td>
              <td>{formatScore(resultat.scoreIntervalle)}</td>
              <td>{formatScore(moyenneExercice(resultat))}</td>
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
