import type { ResultatExerciceProblemeContexte } from "../moteur5e/typesProblemesContexte";

interface Props {
  resultats: ResultatExerciceProblemeContexte[];
  onRecommencer: () => void;
}

function moyenneExercice(r: ResultatExerciceProblemeContexte): number {
  if (r.scenario === "A" && r.combo === "kInverseXAxCarre") return (r.scoreTableau + r.scoreGeneralisation + r.scoreEgaliteAires + r.scoreGraphique + r.scoreJustification) / 5;
  if (r.scenario === "A") return (r.scoreGeneralisationSimple + r.scoreIntersectionSimple + r.scoreExtremumSimple) / 3;
  if (r.scenario === "B") return (r.scoreSysteme + r.scoreResolution + r.scoreFormule + r.scoreEvaluation) / 4;
  return (r.scoreLecture + r.scoreCoutMoyen + r.scoreReconnaissance + r.scoreBenefice + r.scoreSeuil) / 5;
}

const LIBELLE_SCENARIO: Record<ResultatExerciceProblemeContexte["scenario"], string> = {
  A: "Bidons cylindriques",
  B: "Coût unitaire",
  C: "Coûts d'entreprise",
};

export function ResumeSessionProblemeContexte({ resultats, onRecommencer }: Props) {
  const moyenneGenerale = resultats.reduce((a, r) => a + moyenneExercice(r), 0) / resultats.length;
  return (
    <div className="card resume-session">
      <h2>Résumé de la session</h2>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>#</th>
            <th>Scénario</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{LIBELLE_SCENARIO[r.scenario]}</td>
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
