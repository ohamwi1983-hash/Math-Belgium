import type { ExerciceHistogramme } from "../core/histogramme.types";
import type { ResultatExerciceHistogramme } from "../moteur/typesHistogramme";
import { formatClassementAttenduTexte, formatFrequencesAttenduesTexte, formatTraceAttendueTexte } from "../ui/formatHistogramme";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceHistogramme;
  exercice: ExerciceHistogramme;
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
 * (`typesHistogramme.ts`), jamais dérivés du score seul. Ligne "Fréquences" conditionnelle sur
 * `scoreFrequences !== null` (écran sauté pour la variante "effectif") — même principe que le
 * `score-list` d'origine.
 */
export function ResultatPanelHistogramme({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [resultat.scoreClassement, resultat.scoreFrequences, resultat.scoreTrace].filter(
    (score): score is number => score !== null,
  );
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Regroupement en classes et histogramme</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran
        label="Classement (effectif de chaque classe)"
        revele={resultat.classementRevele}
        niveauAide={resultat.niveauAideClassement}
      />
      {resultat.scoreFrequences !== null && (
        <LigneEcran label="Fréquences (%)" revele={resultat.frequencesRevele} niveauAide={resultat.niveauAideFrequences} />
      )}
      <LigneEcran label="Tracé de l'histogramme" revele={resultat.traceRevele} niveauAide={resultat.niveauAideTrace} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreClassement === 0 && (
        <div className="answer-reveal">Effectifs attendus : {formatClassementAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreFrequences === 0 && (
        <div className="answer-reveal">Fréquences attendues : {formatFrequencesAttenduesTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreTrace === 0 && (
        <div className="answer-reveal">Hauteurs attendues : {formatTraceAttendueTexte(exercice)}</div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
