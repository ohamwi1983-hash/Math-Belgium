import type { ResultatExerciceModelisationSinusoide } from "../moteur5e/typesModelisationSinusoide";

interface Props {
  resultats: ResultatExerciceModelisationSinusoide[];
  onRecommencer: () => void;
}

const LIBELLE_TECHNIQUE: Record<string, string> = { b1: "Grande roue (B1)", b2: "Max/min/extremum (B2)", b3: "2 points connus (B3)", donnee: "Fonction déjà donnée" };
const LIBELLE_TYPE: Record<string, string> = { resoudre: "Résoudre f(t)=k", extremum: "Extremum", inequation: "Inéquation" };

function libelleExercice(r: ResultatExerciceModelisationSinusoide): string {
  const base = LIBELLE_TECHNIQUE[r.exercice.phase1.technique];
  if (r.exercice.phase2 === null) return base;
  return `${base} + ${LIBELLE_TYPE[r.exercice.phase2.type]}`;
}

/** Moyenne — filtre les scores absents (`Partial<Record>`, phase hors de la séquence de CETTE
 * instance), jamais comptés comme 0 (même convention transversale que le reste de la plateforme). */
function moyenneExercice(r: ResultatExerciceModelisationSinusoide): number {
  const valeurs = Object.values(r.scores).filter((s): s is number => s !== undefined);
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

export function ResumeSessionModelisationSinusoide({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Exercice</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{libelleExercice(r)}</td>
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
