import type { ExerciceComparaisonSeries } from "../core/comparaisonSeries.types";
import type { ResultatExerciceComparaisonSeries } from "../moteur/typesComparaisonSeries";
import { libelleTypeQuestion, segmentsReponseAttendue } from "../ui/formatComparaisonSeries";
import { LigneRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  resultat: ResultatExerciceComparaisonSeries;
  exercice: ExerciceComparaisonSeries;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Mono-écran, une seule note (comme "Angles associés") — récapitulatif final uniformisé
 * (`LigneRecap`/`statutRecap`, point 10 de l'audit chapitre 5 — jamais un score `X/100` isolé) :
 * une seule `LigneRecap` (pas de `TotalPointsRecap`, une seule ligne rendrait le total redondant
 * avec elle). `niveauAide`/`revele` capturés au moment de la clôture par le moteur. */
export function ResultatPanelComparaisonSeries({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const statut = statutRecap(resultat.revele, resultat.niveauAide);
  const reveler = afficherReponseApresEchec && resultat.score === 0;

  return (
    <div>
      <h2 className="result-title">Comparaison de deux séries statistiques</h2>
      <p className="result-subtitle">{libelleTypeQuestion(resultat.typeQuestion)}</p>
      <LigneRecap label="Score" statut={statut}>
        {libelleStatutRecap(statut)}
      </LigneRecap>
      {reveler && (
        <div className="answer-reveal">
          <SegmentsInline segments={segmentsReponseAttendue(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
