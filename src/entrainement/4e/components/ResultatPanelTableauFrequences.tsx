import type { ExerciceTableauFrequences } from "../core/tableauFrequences.types";
import type { ResultatExerciceTableauFrequences } from "../moteur/typesTableauFrequences";
import {
  formatTableCumulesTexte,
  formatTableFrequencesCumuleesTexte,
  formatTableFrequencesTexte,
  formatTableIdentificationTexte,
} from "../ui/formatTableauFrequences";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceTableauFrequences;
  exercice: ExerciceTableauFrequences;
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
 * `niveauAideXxx`/`xxxRevele` déjà capturés au moment de la clôture de chaque écran côté moteur
 * (`typesTableauFrequences.ts`), jamais dérivés du score seul — une tentative ratée sans aide reste
 * donc verte. 4 écrans, aucun jamais sautable (tous des `number`).
 */
export function ResultatPanelTableauFrequences({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [resultat.scoreIdentification, resultat.scoreFrequences, resultat.scoreCumules, resultat.scoreFrequencesCumulees];
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Tableau de fréquences</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran
        label="Identification (valeurs distinctes et effectifs)"
        revele={resultat.identificationRevele}
        niveauAide={resultat.niveauAideIdentification}
      />
      <LigneEcran label="Fréquences (%)" revele={resultat.frequencesRevele} niveauAide={resultat.niveauAideFrequences} />
      <LigneEcran label="Effectifs cumulés" revele={resultat.cumulesRevele} niveauAide={resultat.niveauAideCumules} />
      <LigneEcran
        label="Fréquences cumulées (%)"
        revele={resultat.frequencesCumuleesRevele}
        niveauAide={resultat.niveauAideFrequencesCumulees}
      />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreIdentification === 0 && (
        <div className="answer-reveal">Valeurs/effectifs attendus : {formatTableIdentificationTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreFrequences === 0 && (
        <div className="answer-reveal">Fréquences attendues : {formatTableFrequencesTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreCumules === 0 && (
        <div className="answer-reveal">Effectifs cumulés attendus : {formatTableCumulesTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreFrequencesCumulees === 0 && (
        <div className="answer-reveal">Fréquences cumulées attendues : {formatTableFrequencesCumuleesTexte(exercice)}</div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
