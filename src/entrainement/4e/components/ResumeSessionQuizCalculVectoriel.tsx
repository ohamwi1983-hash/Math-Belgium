import type { ResultatExerciceQuizCalculVectoriel } from "../moteur/typesQuizCalculVectoriel";
import { RenduFragments } from "./RenduFragments";
import { fragmentsTexteVectoriel } from "../ui/formatQuizCalculVectoriel";

interface Props {
  resultats: ResultatExerciceQuizCalculVectoriel[];
  onRecommencer: () => void;
  onChangerTheme: () => void;
}

function libelleVraiFaux(reponse: boolean): string {
  return reponse ? "Vrai" : "Faux";
}

export function ResumeSessionQuizCalculVectoriel({ resultats, onRecommencer, onChangerTheme }: Props) {
  const nombreCorrectes = resultats.filter((r) => r.score === 100).length;

  return (
    <div>
      <h2 className="result-title">Thème terminé</h2>
      <p className="result-subtitle">
        {nombreCorrectes} / {resultats.length} bonnes réponses
      </p>
      <div className="summary-table-scroll">
        <table className="summary-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Affirmation</th>
              <th>Ta réponse</th>
              <th>Correcte</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((resultat, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <RenduFragments fragments={fragmentsTexteVectoriel(resultat.question.enonce)} />
                </td>
                <td>{libelleVraiFaux(resultat.reponseChoisie)}</td>
                <td>{resultat.score === 100 ? "✓" : "✗"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn btn-primary" onClick={onRecommencer}>
        Refaire ce thème
      </button>
      <button type="button" className="btn" onClick={onChangerTheme}>
        Changer de thème
      </button>
    </div>
  );
}
