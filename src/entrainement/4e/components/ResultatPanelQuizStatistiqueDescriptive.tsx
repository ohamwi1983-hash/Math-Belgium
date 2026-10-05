import type { ResultatExerciceQuizStatistiqueDescriptive } from "../moteur/typesQuizStatistiqueDescriptive";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceQuizStatistiqueDescriptive;
  labelBouton: string;
  onContinuer: () => void;
}

function libelleVraiFaux(reponse: boolean): string {
  return reponse ? "Vrai" : "Faux";
}

/** Mono-écran, une seule note (comme gen38/gen60/gen61/gen62). Contrairement aux autres
 * `ResultatPanel*` du projet, la justification s'affiche TOUJOURS — même en cas de bonne réponse,
 * jamais seulement `afficherReponseApresEchec && score === 0` — puisqu'il s'agit ici d'un quiz de
 * révision où le renforcement pédagogique compte autant après une réussite qu'après un échec.
 * Titre "Bonne réponse !"/"Mauvaise réponse", jamais "Vrai !"/"Faux !" : ces mots désignent déjà la
 * valeur de vérité de l'AFFIRMATION, les réutiliser pour qualifier la performance de l'élève
 * créerait une collision de sens (même choix que "Cercle trigonométrique & triangles
 * quelconques"). Récapitulatif uniformisé (`LigneRecap`/`statutRecap`, point 10 de l'audit
 * chapitre 5 — jamais un score `X/100` isolé) ; jamais d'orange ici, une seule tentative sans aide
 * progressive (`sessionQuizStatistiqueDescriptive.ts`) donc `statutRecap(revele, null)` ne peut
 * produire que vert/rouge. */
export function ResultatPanelQuizStatistiqueDescriptive({ resultat, labelBouton, onContinuer }: Props) {
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
