import type { ResultatExerciceTriangleLies } from "../moteur/typesTriangleLies";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceTriangleLies[];
  onRecommencer: () => void;
}

const LIBELLE_VARIANTE: Record<"cotePartage" | "anglePartage" | "sommetPartage", string> = {
  cotePartage: "Côté partagé",
  anglePartage: "Angle partagé",
  sommetPartage: "Sommet partagé",
};

/** Moyenne sur jusqu'à 5 scores (`scoreAngles`/`scoreSoustraction` potentiellement `null` selon la
 * configuration, filtrés, jamais comptés comme 0 — même principe que "Problèmes d'optimisation"). */
function moyenneExercice(resultat: ResultatExerciceTriangleLies): number {
  const scores = [resultat.scorePont, resultat.scoreAngles, resultat.scoreSoustraction, resultat.scoreCible, resultat.scoreInterpretation].filter(
    (s): s is number => s !== null,
  );
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionTriangleLies({ resultats, onRecommencer }: Props) {
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
              <th>Pont</th>
              <th>Angles</th>
              <th>Soustraction</th>
              <th>Cible</th>
              <th>Interprétation</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
                <td>{formatScore(resultat.scorePont)}</td>
                <td>{resultat.scoreAngles === null ? "—" : formatScore(resultat.scoreAngles)}</td>
                <td>{resultat.scoreSoustraction === null ? "—" : formatScore(resultat.scoreSoustraction)}</td>
                <td>{formatScore(resultat.scoreCible)}</td>
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
