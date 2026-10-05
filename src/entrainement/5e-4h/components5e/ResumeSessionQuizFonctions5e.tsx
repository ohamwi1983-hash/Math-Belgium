import type { ResultatExerciceQuizFonctions5e } from "../moteur5e/typesQuizFonctions5e";

interface Props {
  resultats: ResultatExerciceQuizFonctions5e[];
  onRecommencer: () => void;
  onChangerTheme: () => void;
}

function libelleVraiFaux(reponse: boolean): string {
  return reponse ? "Vrai" : "Faux";
}

/** Récapitulatif final à plat, coloré (convention CLAUDE.md), jamais un score X/100 seul —
 * `onChangerTheme` ramène à l'écran de choix du thème DE CE générateur, jamais à l'accueil global
 * de la plateforme (voir `App5gen39.tsx`). */
export function ResumeSessionQuizFonctions5e({ resultats, onRecommencer, onChangerTheme }: Props) {
  const nombreCorrectes = resultats.filter((r) => r.score === 100).length;
  const moyenne = resultats.reduce((somme, r) => somme + r.score, 0) / resultats.length;

  return (
    <div>
      <h2 className="result-title">Thème terminé</h2>
      <p className="result-subtitle">
        {nombreCorrectes} / {resultats.length} bonnes réponses
      </p>
      <div className="score-hero">
        <div className="score-hero-value">{moyenne.toFixed(0)}/100</div>
        <div className="score-hero-label">score moyen</div>
      </div>
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
