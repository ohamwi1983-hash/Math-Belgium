import type { ResultatExerciceOptimisation } from "../moteur/typesOptimisation";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceOptimisation[];
  onRecommencer: () => void;
}

const LIBELLE_VARIANTE: Record<"modelisation" | "fonctionDonnee", string> = {
  modelisation: "Modélisation",
  fonctionDonnee: "Fonction donnée",
};

/** Moyenne sur jusqu'à 7 scores (4 potentiellement `null` pour `fonctionDonnee`, filtrés, jamais
 * comptés comme 0 — même principe que "Paramètres de position"). */
function moyenneExercice(resultat: ResultatExerciceOptimisation): number {
  const scores = [
    resultat.scoreIdentification,
    resultat.scoreContrainteEtGrandeur,
    resultat.scoreSysteme,
    resultat.scoreDomaine,
    resultat.scoreSommet,
    resultat.scoreDecision,
    resultat.scoreInterpretation,
  ].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionOptimisation({ resultats, onRecommencer }: Props) {
  const moyenne = resultats.reduce((somme, r) => somme + moyenneExercice(r), 0) / resultats.length;

  return (
    <div>
      <h2 className="result-title">Session terminée</h2>
      <p className="result-subtitle">{resultats.length} exercices complétés</p>
      <div className="score-hero">
        <div className="score-hero-value">{moyenne.toFixed(0)}/100</div>
        <div className="score-hero-label">score moyen</div>
      </div>
      <div className="summary-table-scroll">
        <table className="summary-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Variante</th>
              <th>Identification</th>
              <th>Contrainte + grandeur</th>
              <th>Système</th>
              <th>Domaine</th>
              <th>Sommet</th>
              <th>Décision</th>
              <th>Interprétation</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
                <td>{resultat.scoreIdentification === null ? "—" : formatScore(resultat.scoreIdentification)}</td>
                <td>{resultat.scoreContrainteEtGrandeur === null ? "—" : formatScore(resultat.scoreContrainteEtGrandeur)}</td>
                <td>{resultat.scoreSysteme === null ? "—" : formatScore(resultat.scoreSysteme)}</td>
                <td>{resultat.scoreDomaine === null ? "—" : formatScore(resultat.scoreDomaine)}</td>
                <td>{formatScore(resultat.scoreSommet)}</td>
                <td>{formatScore(resultat.scoreDecision)}</td>
                <td>{formatScore(resultat.scoreInterpretation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn btn-primary" onClick={onRecommencer}>
        Recommencer
      </button>
    </div>
  );
}
