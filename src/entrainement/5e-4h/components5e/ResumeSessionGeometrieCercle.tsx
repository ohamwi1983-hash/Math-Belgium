import type { ResultatExerciceGeometrieCercle } from "../moteur5e/typesGeometrieCercle";

interface Props {
  resultats: ResultatExerciceGeometrieCercle[];
  onRecommencer: () => void;
}

const LABEL_SCENARIO: Record<ResultatExerciceGeometrieCercle["scenario"], string> = {
  secteurBalaye: "Secteur balayé",
  segmentCirculaire: "Segment circulaire",
  lentille: "Lentille",
};

function scoresExercice(r: ResultatExerciceGeometrieCercle): number[] {
  switch (r.scenario) {
    case "secteurBalaye":
      return [r.scoreConversionRad, r.scoreAireGrandSecteur, r.scoreAirePetitSecteur, r.scoreAireBalayee];
    case "segmentCirculaire":
      return [r.scoreAngleTheta, r.scoreAireSecteur, r.scoreAireTriangle, r.scoreAireSegment];
    case "lentille":
      return [r.scoreAngle1, r.scoreSecteur1, r.scoreTriangle1, r.scoreSegmentAire1, r.scoreAngle2, r.scoreSecteur2, r.scoreTriangle2, r.scoreSegmentAire2, r.scoreAireLentille];
  }
}

function moyenneExercice(r: ResultatExerciceGeometrieCercle): number {
  const scores = scoresExercice(r);
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function ResumeSessionGeometrieCercle({ resultats, onRecommencer }: Props) {
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
              <td>{LABEL_SCENARIO[r.scenario]}</td>
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
