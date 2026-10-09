import type { ResultatExerciceProprietesOptiquesConiques } from "../moteur6e/typesProprietesOptiquesConiques";
import { calculerTotalPointsProprietesOptiquesConiques } from "../ui6e/formatProprietesOptiquesConiques";

interface Props {
  resultats: ResultatExerciceProprietesOptiquesConiques[];
  onRecommencer: () => void;
}

const LIBELLE_NATURE: Record<"ellipse" | "hyperbole", string> = { ellipse: "Ellipse", hyperbole: "Hyperbole" };

/** Résumé de session — mêmes conventions que `ResumeSessionIntersectionsConiques.tsx` (6gen61) : une
 * moyenne (jamais un score fractionnaire "X/100" isolé) par exercice. Une seule famille ici, donc la
 * colonne "Exercice" affiche la NATURE de la conique (ellipse/hyperbole) plutôt qu'un libellé de
 * famille. */
export function ResumeSessionProprietesOptiquesConiques({ resultats, onRecommencer }: Props) {
  const moyennes = resultats.map((r) => {
    const { total, maximum } = calculerTotalPointsProprietesOptiquesConiques(r);
    return (total / maximum) * 100;
  });
  const moyenneGenerale = moyennes.reduce((a, m) => a + m, 0) / moyennes.length;

  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Exercice</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LIBELLE_NATURE[r.exercice.natureConique]}</td>
              <td>{Math.round(moyennes[i])}/100</td>
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
