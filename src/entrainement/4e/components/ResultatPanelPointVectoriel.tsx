import type { ExercicePointVectoriel } from "../core/pointVectoriel.types";
import type { ResultatExercicePointVectoriel } from "../moteur/typesPointVectoriel";
import { libelleVariantePointVectoriel } from "../ui/formatPointVectoriel";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExercicePointVectoriel;
  exercice: ExercicePointVectoriel;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100`. Pas de bouton
 * "Aide" sur ce générateur (une seule phase, jamais de niveauAide) — toujours `0`, jamais orange. */
export function ResultatPanelPointVectoriel({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const statut = statutRecap(resultat.coordonneesRevele, 0);

  return (
    <div>
      <h2 className="result-title">{libelleVariantePointVectoriel(exercice.variante)}</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneRecap label={`Coordonnées de ${exercice.pointCherche}`} statut={statut}>
        {libelleStatutRecap(statut)}
      </LigneRecap>
      <TotalPointsRecap points={resultat.scoreCoordonnees} maxPoints={100} />
      {afficherReponseApresEchec && resultat.scoreCoordonnees === 0 && (
        <div className="answer-reveal">
          {exercice.pointCherche} attendu : ({exercice.reponse.x} ; {exercice.reponse.y})
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
