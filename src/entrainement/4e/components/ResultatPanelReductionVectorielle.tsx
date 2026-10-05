import type { ExerciceReductionVectorielle } from "../core/reductionVectorielle.types";
import type { ResultatExerciceReductionVectorielle } from "../moteur/typesReductionVectorielle";
import { libelleFigure } from "../ui/formatReductionVectorielle";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceReductionVectorielle;
  exercice: ExerciceReductionVectorielle;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/**
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100`. Un seul écran
 * noté (`reductionRevele`), aucun système d'aide sur ce générateur (`niveauAide=null` — jamais
 * orange, uniquement vert/rouge).
 */
export function ResultatPanelReductionVectorielle({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const statut = statutRecap(resultat.reductionRevele, null);
  return (
    <div>
      <h2 className="result-title">Réduction d'une somme de vecteurs — {libelleFigure(exercice)}</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneRecap label="Réduction en un seul vecteur" statut={statut}>
        {libelleStatutRecap(statut)}
      </LigneRecap>
      <TotalPointsRecap points={resultat.scoreReduction} maxPoints={100} />
      {afficherReponseApresEchec && resultat.scoreReduction === 0 && (
        <div className="answer-reveal">
          Réponse attendue : {exercice.pointDepart}
          {exercice.pointArrivee}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
