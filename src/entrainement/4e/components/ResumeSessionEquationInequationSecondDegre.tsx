import type { ResultatExerciceEquationInequationSecondDegre } from "../moteur/typesEquationInequationSecondDegre";
import { libelleFamilleEquationInequationSecondDegre } from "../ui/formatEquationInequationSecondDegre";
import { formatScore } from "../ui/formatScore";

interface Props {
  resultats: ResultatExerciceEquationInequationSecondDegre[];
  onRecommencer: () => void;
}

const LIBELLE_VARIANTE: Record<"equation" | "inequation", string> = {
  equation: "Équation",
  inequation: "Inéquation",
};

function scoreOuTiret(score: number | null): string {
  return score === null ? "—" : formatScore(score);
}

/** Moyenne sur les scores TOUJOURS renseignés (6) + les scores conditionnels
 * (`scorePoserSysteme`/`scoreEliminerSysteme`/`scoreIdentification`/`scoreContrainteEtGrandeur`/
 * `scoreSysteme`/`scorePoserEquationInequation`, potentiellement `null` selon `voieSysteme`/
 * `base.variante`/`base.identificationXY`) — filtrés, jamais comptés comme 0. */
function moyenneExercice(resultat: ResultatExerciceEquationInequationSecondDegre): number {
  const scores = [
    resultat.scorePoserSysteme,
    resultat.scoreEliminerSysteme,
    resultat.scoreIdentification,
    resultat.scoreContrainteEtGrandeur,
    resultat.scoreSysteme,
    resultat.scoreDomaine,
    resultat.scorePoserEquationInequation,
    resultat.scoreResoudre,
    resultat.scoreValidation,
    resultat.scoreInterpretation,
  ].filter((s): s is number => s !== null);
  return scores.reduce((somme, s) => somme + s, 0) / scores.length;
}

export function ResumeSessionEquationInequationSecondDegre({ resultats, onRecommencer }: Props) {
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
              <th>Famille</th>
              <th>Variante</th>
              <th>Système</th>
              <th>Élimination</th>
              <th>Identification</th>
              <th>Contrainte + grandeur</th>
              <th>Résolution du système</th>
              <th>Domaine</th>
              <th>Poser</th>
              <th>Résolution</th>
              <th>Validation</th>
              <th>Interprétation</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{libelleFamilleEquationInequationSecondDegre(resultat.famille)}</td>
                <td>{LIBELLE_VARIANTE[resultat.variante]}</td>
                <td>{scoreOuTiret(resultat.scorePoserSysteme)}</td>
                <td>{scoreOuTiret(resultat.scoreEliminerSysteme)}</td>
                <td>{scoreOuTiret(resultat.scoreIdentification)}</td>
                <td>{scoreOuTiret(resultat.scoreContrainteEtGrandeur)}</td>
                <td>{scoreOuTiret(resultat.scoreSysteme)}</td>
                <td>{scoreOuTiret(resultat.scoreDomaine)}</td>
                <td>{scoreOuTiret(resultat.scorePoserEquationInequation)}</td>
                <td>{formatScore(resultat.scoreResoudre)}</td>
                <td>{formatScore(resultat.scoreValidation)}</td>
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
