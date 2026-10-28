import type { ResultatExerciceQuizStatistiqueDescriptive } from "../moteur/typesQuizStatistiqueDescriptive";

interface Props {
  resultats: ResultatExerciceQuizStatistiqueDescriptive[];
  onRecommencer: () => void;
  onChangerTheme: () => void;
}

function libelleVraiFaux(reponse: boolean): string {
  return reponse ? "Vrai" : "Faux";
}

/** Résumé de fin de thème — seulement le nombre de bonnes réponses (plus aucun score « /100 »
 * depuis le retrait du comptage des points). Le tableau passe en cartes sur mobile
 * (`summary-table-cartes`, `theme.css`) : à 390 px, quatre colonnes laissaient environ 80 px à
 * l'affirmation et faisaient monter la page au-delà de 7 000 px. */
export function ResumeSessionQuizStatistiqueDescriptive({ resultats, onRecommencer, onChangerTheme }: Props) {
  const nombreCorrectes = resultats.filter((r) => r.score === 100).length;

  return (
    <div>
      <h2 className="result-title">Thème terminé</h2>
      <p className="result-subtitle">
        {nombreCorrectes} / {resultats.length} bonnes réponses
      </p>
      <div className="summary-table-scroll">
        <table className="summary-table summary-table-cartes">
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
                <td data-label="#">{index + 1}</td>
                <td data-label="Affirmation">{resultat.question.enonce}</td>
                <td data-label="Ta réponse">{libelleVraiFaux(resultat.reponseChoisie)}</td>
                <td data-label="Correcte">{resultat.score === 100 ? "✓" : "✗"}</td>
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
