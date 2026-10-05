import type { ResultatExerciceQuizDerivees5e } from "../moteur5e/typesQuizDerivees5e";

interface Props {
  resultat: ResultatExerciceQuizDerivees5e;
  labelBouton: string;
  onContinuer: () => void;
}

function classeScore(score: number): string {
  return score === 100 ? "score-value is-good" : "score-value is-bad";
}

function libelleVraiFaux(reponse: boolean): string {
  return reponse ? "Vrai" : "Faux";
}

/** Mono-écran, une seule note (comme le quiz vrai/faux du chapitre 4, 5gen42, du chapitre 3,
 * 5gen41, du chapitre 2, 5gen40, et du chapitre 1, 5gen39). La justification s'affiche TOUJOURS —
 * même en cas de bonne réponse, jamais seulement en cas d'échec — puisqu'il s'agit d'un quiz de
 * révision où le renforcement pédagogique compte autant après une réussite qu'après un échec.
 * Titre "Bonne réponse !"/"Mauvaise réponse", jamais "Vrai !"/"Faux !" : ces mots désignent déjà la
 * valeur de vérité de l'AFFIRMATION, les réutiliser pour qualifier la performance de l'élève
 * créerait une collision de sens. `.aide-5e` (jamais `.triangle-quelconque-aide`, réservé au 4e)
 * pour le bloc de justification, convention transversale de ce chantier. */
export function ResultatPanelQuizDerivees5e({ resultat, labelBouton, onContinuer }: Props) {
  const correct = resultat.score === 100;

  return (
    <div>
      <h2 className="result-title">{correct ? "Bonne réponse !" : "Mauvaise réponse"}</h2>
      <p className="result-subtitle">{resultat.question.enonce}</p>
      <ul className="score-list">
        <li className="score-item">
          <span>Ta réponse</span>
          <span>{libelleVraiFaux(resultat.reponseChoisie)}</span>
        </li>
        <li className="score-item">
          <span>Réponse correcte</span>
          <span>{libelleVraiFaux(resultat.question.reponse)}</span>
        </li>
        <li className="score-item">
          <span>Score</span>
          <span className={classeScore(resultat.score)}>{resultat.score}/100</span>
        </li>
      </ul>
      <div className="aide-5e">
        <p>{resultat.question.justification}</p>
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
