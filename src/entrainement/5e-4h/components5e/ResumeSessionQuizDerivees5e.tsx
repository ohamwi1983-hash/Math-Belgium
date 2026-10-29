import type { ResultatExerciceQuizDerivees5e } from "../moteur5e/typesQuizDerivees5e";

interface Props {
  resultats: ResultatExerciceQuizDerivees5e[];
  onRecommencer: () => void;
  onChangerTheme: () => void;
}

function libelleVraiFaux(reponse: boolean): string {
  return reponse ? "Vrai" : "Faux";
}

/** Récapitulatif final à plat, coloré (convention CLAUDE.md) : seulement le nombre
 * de bonnes réponses, plus aucun score depuis le retrait du comptage des points —
 * `onChangerTheme` ramène à l'écran de choix du thème DE CE générateur, jamais à l'accueil global
 * de la plateforme (voir `App5gen43.tsx`). */
export function ResumeSessionQuizDerivees5e({ resultats, onRecommencer, onChangerTheme }: Props) {
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
                <td>{resultat.question.enonce}</td>
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
