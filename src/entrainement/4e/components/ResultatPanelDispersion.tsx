import type { ExerciceDispersion } from "../core/dispersion.types";
import type { ResultatExerciceDispersion } from "../moteur/typesDispersion";
import { formatEcartTypeAttendueTexte, formatTableauAttenduTexte, formatVarianceAttendueTexte } from "../ui/formatDispersion";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  resultat: ResultatExerciceDispersion;
  exercice: ExerciceDispersion;
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
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran.
 * `niveauAide`/`revele` déjà capturés côté moteur (`ResultatExerciceDispersion`) au moment précis de
 * la clôture de chaque écran — jamais dérivés du score seul, une tentative ratée sans aide reste
 * donc verte. 2 écrans FIXES (jamais `null`, aucune étape sautable ici — voir `typesDispersion.ts`).
 */
export function ResultatPanelDispersion({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreTableau + resultat.scoreVarianceEcartType;
  const maxPoints = 200;

  return (
    <div>
      <h2 className="result-title">Paramètres de dispersion</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Tableau et sommes intermédiaires" revele={resultat.tableauRevele} niveauAide={resultat.niveauAideTableau} />
      <LigneEcran label="Variance et écart-type" revele={resultat.varianceEcartTypeRevele} niveauAide={resultat.niveauAideVarianceEcartType} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreTableau === 0 && (
        <div className="answer-reveal">
          Sommes attendues : <SegmentsInline segments={formatTableauAttenduTexte(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreVarianceEcartType === 0 && (
        <div className="answer-reveal">
          Variance attendue : {formatVarianceAttendueTexte(exercice)}, écart-type attendu : {formatEcartTypeAttendueTexte(exercice)}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
