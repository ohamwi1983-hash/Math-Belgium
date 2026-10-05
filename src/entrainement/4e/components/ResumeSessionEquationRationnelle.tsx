import type { ResultatExerciceEquationRationnelle } from "../moteur/typesEquationRationnelle";
import { formatScore } from "../ui/formatScore";
import { libelleCategorie } from "../ui/categorieLabels";

interface Props {
  resultats: ResultatExerciceEquationRationnelle[];
  onRecommencer: () => void;
}

/** scoreReconnaissance peut être null (étape sautée, categorie mise_en_evidence_generalisee) — exclu de la moyenne, pas compté comme 0. */
function moyenneExercice(resultat: ResultatExerciceEquationRationnelle): number {
  const scores = [
    resultat.scoreCE,
    resultat.scoreSimplifier,
    resultat.scoreSimplifierReduction,
    resultat.scoreSimplifierReconnaissance,
    resultat.scoreSimplifierChamp1,
    resultat.scoreSimplifierChamp2,
    resultat.scoreSimplifierFraction,
    resultat.scoreIsolement,
    resultat.scoreReconnaissance,
    resultat.scoreChampPrincipal,
    resultat.scoreRacines,
    resultat.scoreRacinesEtrangeres,
  ].filter((score): score is number => score !== null);
  return scores.reduce((somme, score) => somme + score, 0) / scores.length;
}

export function ResumeSessionEquationRationnelle({ resultats, onRecommencer }: Props) {
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
            <th>Méthode</th>
            <th>CE</th>
            <th>Isol.</th>
            <th>Factorisation</th>
            <th>Solutions</th>
            <th>Sol. étrangères</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{libelleCategorie(resultat.categorie)}</td>
              <td>{formatScore(resultat.scoreCE)}</td>
              <td>{formatScore(resultat.scoreIsolement)}</td>
              <td>{resultat.scoreChampPrincipal === null ? "—" : formatScore(resultat.scoreChampPrincipal)}</td>
              <td>{formatScore(resultat.scoreRacines)}</td>
              <td>{formatScore(resultat.scoreRacinesEtrangeres)}</td>
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
