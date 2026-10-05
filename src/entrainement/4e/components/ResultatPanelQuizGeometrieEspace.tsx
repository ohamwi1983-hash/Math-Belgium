import type { ResultatExerciceQuizGeometrieEspace } from "../moteur/typesQuizGeometrieEspace";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceQuizGeometrieEspace;
  labelBouton: string;
  onContinuer: () => void;
}

function libelleVraiFaux(reponse: boolean): string {
  return reponse ? "Vrai" : "Faux";
}

/** Mono-écran, une seule note (comme les 7 quiz précédents). La justification s'affiche TOUJOURS —
 * même en cas de bonne réponse, jamais seulement `afficherReponseApresEchec && score === 0` —
 * puisqu'il s'agit d'un quiz de révision où le renforcement pédagogique compte autant après une
 * réussite qu'après un échec. Titre "Bonne réponse !"/"Mauvaise réponse", jamais "Vrai !"/"Faux !" :
 * ces mots désignent déjà la valeur de vérité de l'AFFIRMATION, les réutiliser pour qualifier la
 * performance de l'élève créerait une collision de sens (même choix que les 7 quiz précédents).
 * Récapitulatif uniformisé (`LigneRecap`/`statutRecap`, jamais un score `X/100` isolé) ; jamais
 * d'orange ici, une seule tentative sans aide progressive donc `statutRecap(revele, null)` ne peut
 * produire que vert/rouge. */
export function ResultatPanelQuizGeometrieEspace({ resultat, labelBouton, onContinuer }: Props) {
  const correct = resultat.score === 100;
  const statut = statutRecap(resultat.revele, null);

  return (
    <div>
      <h2 className="result-title">{correct ? "Bonne réponse !" : "Mauvaise réponse"}</h2>
      <p className="result-subtitle">{resultat.question.enonce}</p>
      <p className="prompt-text">
        Ta réponse : {libelleVraiFaux(resultat.reponseChoisie)} — Réponse correcte : {libelleVraiFaux(resultat.question.reponse)}
      </p>
      <LigneRecap label="Résultat" statut={statut}>
        {libelleStatutRecap(statut)}
      </LigneRecap>
      <TotalPointsRecap points={resultat.score} maxPoints={100} />
      <div className="triangle-quelconque-aide">{resultat.question.justification}</div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
