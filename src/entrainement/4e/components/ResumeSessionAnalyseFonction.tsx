import type { ResultatExerciceAnalyseFonction } from "../moteur/typesAnalyseFonction";
import { libelleCategorie } from "../ui/categorieLabels";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceAnalyseFonction[];
  onRecommencer: () => void;
}

/** Moyenne des étapes réellement traversées (activées par le professeur) pour cet exercice. */
function moyenneExercice(resultat: ResultatExerciceAnalyseFonction): number {
  const scores = [
    resultat.scoreCoefficients,
    resultat.scoreAllure,
    resultat.scoreAxeSommet,
    resultat.scoreDomaineImage,
    resultat.scoreRacinesReconnaissance,
    resultat.scoreRacinesChamp1,
    resultat.scoreRacinesChamp2,
    resultat.scoreTableauSignes,
  ].filter((score): score is number => score !== null);
  return scores.reduce((somme, score) => somme + score, 0) / scores.length;
}

export function ResumeSessionAnalyseFonction({ resultats, onRecommencer }: Props) {
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
            <th>Catégorie</th>
            <th>Coeff.</th>
            <th>Allure</th>
            <th>Axe/S</th>
            <th>Dom/Im</th>
            <th>Racines</th>
            <th>Signe/Var.</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleCategorie(resultat.categorie)}</td>
              <td>{resultat.scoreCoefficients === null ? "—" : formatScore(resultat.scoreCoefficients)}</td>
              <td>{resultat.scoreAllure === null ? "—" : formatScore(resultat.scoreAllure)}</td>
              <td>{resultat.scoreAxeSommet === null ? "—" : formatScore(resultat.scoreAxeSommet)}</td>
              <td>{resultat.scoreDomaineImage === null ? "—" : formatScore(resultat.scoreDomaineImage)}</td>
              <td>{resultat.scoreRacinesChamp2 === null ? "—" : formatScore(resultat.scoreRacinesChamp2)}</td>
              <td>{resultat.scoreTableauSignes === null ? "—" : formatScore(resultat.scoreTableauSignes)}</td>
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
