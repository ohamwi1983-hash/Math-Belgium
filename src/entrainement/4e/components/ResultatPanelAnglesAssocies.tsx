import type { ExerciceAnglesAssocies } from "../core/anglesAssocies.types";
import type { ResultatExerciceAnglesAssocies } from "../moteur/typesAnglesAssocies";
import { LigneRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceAnglesAssocies;
  exercice: ExerciceAnglesAssocies;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Refonte écran unique (`promptgen17refontecomplete.md`) — un seul score désormais (l'ancienne
 * ventilation "Question 1"/"Question complémentaire"/"Valeur finale" disparaît avec les écrans
 * qu'elle notait individuellement). Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`,
 * point 10 de l'audit chapitre 3) — une seule `LigneRecap` (pas de `TotalPointsRecap`, une seule
 * ligne rendrait le total redondant avec elle), jamais un score fractionnaire `X/100`. */
export function ResultatPanelAnglesAssocies({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const statut = statutRecap(resultat.revele, resultat.niveauAide);

  return (
    <div>
      <h2 className="result-title">Angles associés</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneRecap label="Score" statut={statut}>
        {libelleStatutRecap(statut)}
      </LigneRecap>
      {afficherReponseApresEchec && resultat.score === 0 && (
        <div className="answer-reveal">Valeur attendue : {exercice.valeurCible}</div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
