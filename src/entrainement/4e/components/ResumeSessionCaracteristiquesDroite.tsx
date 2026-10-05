import type { ResultatExerciceCaracteristiquesDroite } from "../moteur/typesCaracteristiquesDroite";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceCaracteristiquesDroite[];
  onRecommencer: () => void;
}

/** Les 2 scores sont toujours des `number` — moyenne directe sur `/2`, jamais de filtre `!== null`
 * nécessaire (même simplicité que "Relations entre droites"/"Construction graphique — tracer une
 * droite"). */
function moyenneExercice(resultat: ResultatExerciceCaracteristiquesDroite): number {
  return (resultat.scoreExtraction + resultat.scoreCaracteristiques) / 2;
}

export function ResumeSessionCaracteristiquesDroite({ resultats, onRecommencer }: Props) {
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
            <th>Forme</th>
            <th>Verticale</th>
            <th>Extraction</th>
            <th>Caractéristiques</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((resultat, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{resultat.variante}</td>
              <td>{resultat.verticale ? "Oui" : "Non"}</td>
              <td>{formatScore(resultat.scoreExtraction)}</td>
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
