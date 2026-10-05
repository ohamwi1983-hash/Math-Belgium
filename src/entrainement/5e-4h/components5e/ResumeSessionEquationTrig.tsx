import type { ResultatExerciceEquationTrigonometrique } from "../moteur5e/typesEquationTrig";

interface Props {
  resultats: ResultatExerciceEquationTrigonometrique[];
  onRecommencer: () => void;
}

const LIBELLE_FAMILLE: Record<string, string> = { directe: "Application directe", produit: "Produit de facteurs", pythagoricienne: "Substitution pythagoricienne", egalite: "Égalité de 2 expressions" };

/** Moyenne d'un exercice — filtre les scores `null` (écran absent de la séquence pour cette
 * instance, jamais compté comme 0), même convention transversale que le reste de la plateforme. */
function moyenneExercice(r: ResultatExerciceEquationTrigonometrique): number {
  let scores: (number | null)[];
  switch (r.famille) {
    case "directe":
      scores = [r.scoreReconnaissance, r.scoreArgument, r.scoreIsolerX, r.scoreSolutions];
      break;
    case "produit":
      scores = [r.scoreReconnaissance, r.scorePrefacteur, r.scoreSeparerFacteurs, r.scoreArgumentProduit, r.scoreIsolerXProduit, r.scoreSolutionsProduit];
      break;
    case "pythagoricienne":
      scores = [r.scoreReconnaissance, r.scoreConversionPythagoricienne, r.scoreRacinesPythagoricienne, r.scoreRacinesResolution, r.scoreSolutionsPythagoricienne];
      break;
    case "egalite":
      scores = [r.scoreReconnaissance, r.scoreConversionEgalite, r.scoreResoudreEgalite, r.scoreSolutionsEgalite];
      break;
  }
  const valeurs = scores.filter((s): s is number => s !== null);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionEquationTrig({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Technique</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LIBELLE_FAMILLE[r.famille]}</td>
              <td>{Math.round(moyenneExercice(r))}/100</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Moyenne générale : {Math.round(moyenneGenerale)}/100</p>
      <button type="button" className="btn btn-primary" onClick={onRecommencer}>
        Recommencer
      </button>
    </div>
  );
}
