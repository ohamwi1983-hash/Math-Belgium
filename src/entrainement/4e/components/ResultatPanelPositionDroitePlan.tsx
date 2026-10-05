import type { ExercicePositionDroitePlan } from "../core/positionDroitePlan.types";
import type { ResultatExercicePositionDroitePlan } from "../moteur/typesPositionDroitePlan";
import { LIBELLE_CLASSIFICATION, libelleDroite, libellePlan, texteReponseJustificationAttendue } from "../ui/formatPositionDroitePlan";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExercicePositionDroitePlan;
  exercice: ExercicePositionDroitePlan;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, niveauAide }: { label: string; revele: boolean; niveauAide: number }) {
  const statut = statutRecap(revele, niveauAide);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/**
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100`.
 */
export function ResultatPanelPositionDroitePlan({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreClassification + resultat.scoreJustification;
  const maxPoints = 200;

  return (
    <div>
      <h2 className="result-title">Position d'une droite par rapport à un plan</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Classification" revele={resultat.classificationRevele} niveauAide={resultat.niveauAideClassification} />
      <LigneEcran label="Justification" revele={resultat.justificationRevele} niveauAide={resultat.niveauAideJustification} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreClassification === 0 && (
        <div className="answer-reveal">
          Classification attendue : la droite {libelleDroite(exercice)} est {LIBELLE_CLASSIFICATION[resultat.classification].toLowerCase()}{" "}
          (plan {libellePlan(exercice)}).
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreJustification === 0 && (
        <div className="answer-reveal">Justification attendue : {texteReponseJustificationAttendue(exercice)}.</div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
