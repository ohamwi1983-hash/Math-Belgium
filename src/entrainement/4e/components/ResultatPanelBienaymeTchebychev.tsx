import type { ExerciceBienaymeTchebychev } from "../core/bienaymeTchebychev.types";
import type { ResultatExerciceBienaymeTchebychev } from "../moteur/typesBienaymeTchebychev";
import {
  formatIntervalleAttenduTexte,
  formatKAttenduTexte,
  formatNombreAttenduTexte,
  formatPourcentAttenduTexte,
  formatPourcentDepuisNombreAttenduTexte,
  formatSigmaAttenduTexte,
  formatXBarAttenduTexte,
} from "../ui/formatBienaymeTchebychev";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceBienaymeTchebychev;
  exercice: ExerciceBienaymeTchebychev;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, score, revele, niveauAide }: { label: string; score: number | null; revele: boolean; niveauAide: number }) {
  if (score === null) return null;
  const statut = statutRecap(revele, niveauAide);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/**
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, point 10 de
 * l'audit chapitre 5 — remplace l'ancien format `score-list`/`X/100` par écran). Jusqu'à 3 des 20
 * écrans possibles sont réellement présents pour un exercice donné (selon la variante) — chaque
 * `LigneEcran` se rend `null` si son score est `null`, même principe que
 * "Cercle trigonométrique & triangles quelconques". `niveauAide`/`revele` capturés au moment de la
 * clôture de chaque écran côté moteur (jamais dérivés du score seul) — une tentative ratée sans
 * aide reste donc verte.
 */
export function ResultatPanelBienaymeTchebychev({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [
    resultat.scoreV1K,
    resultat.scoreV1Pourcent,
    resultat.scoreV2K,
    resultat.scoreV2Intervalle,
    resultat.scoreV3K,
    resultat.scoreV3Pourcent,
    resultat.scoreV3Nombre,
    resultat.scoreV4Pourcent0,
    resultat.scoreV4K,
    resultat.scoreV4Intervalle,
    resultat.scoreV5K,
    resultat.scoreV5Sigma,
    resultat.scoreV6K,
    resultat.scoreV6XBar,
    resultat.scoreV7Pourcent0,
    resultat.scoreV7K,
    resultat.scoreV7Sigma,
    resultat.scoreV8Pourcent0,
    resultat.scoreV8K,
    resultat.scoreV8XBar,
  ].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Inégalité de Bienaymé-Tchebychev</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>

      <LigneEcran label="k" score={resultat.scoreV1K} revele={resultat.v1KRevele} niveauAide={resultat.niveauAideV1K} />
      <LigneEcran label="% minimal" score={resultat.scoreV1Pourcent} revele={resultat.v1PourcentRevele} niveauAide={resultat.niveauAideV1Pourcent} />
      <LigneEcran label="k" score={resultat.scoreV2K} revele={resultat.v2KRevele} niveauAide={resultat.niveauAideV2K} />
      <LigneEcran label="Intervalle" score={resultat.scoreV2Intervalle} revele={resultat.v2IntervalleRevele} niveauAide={resultat.niveauAideV2Intervalle} />
      <LigneEcran label="k" score={resultat.scoreV3K} revele={resultat.v3KRevele} niveauAide={resultat.niveauAideV3K} />
      <LigneEcran label="% minimal (intermédiaire)" score={resultat.scoreV3Pourcent} revele={resultat.v3PourcentRevele} niveauAide={resultat.niveauAideV3Pourcent} />
      <LigneEcran label="Nombre minimal d'individus" score={resultat.scoreV3Nombre} revele={resultat.v3NombreRevele} niveauAide={resultat.niveauAideV3Nombre} />
      <LigneEcran label="% minimal (depuis le nombre donné)" score={resultat.scoreV4Pourcent0} revele={resultat.v4Pourcent0Revele} niveauAide={resultat.niveauAideV4Pourcent0} />
      <LigneEcran label="k" score={resultat.scoreV4K} revele={resultat.v4KRevele} niveauAide={resultat.niveauAideV4K} />
      <LigneEcran label="Intervalle" score={resultat.scoreV4Intervalle} revele={resultat.v4IntervalleRevele} niveauAide={resultat.niveauAideV4Intervalle} />
      <LigneEcran label="k" score={resultat.scoreV5K} revele={resultat.v5KRevele} niveauAide={resultat.niveauAideV5K} />
      <LigneEcran label="Écart-type σ" score={resultat.scoreV5Sigma} revele={resultat.v5SigmaRevele} niveauAide={resultat.niveauAideV5Sigma} />
      <LigneEcran label="k" score={resultat.scoreV6K} revele={resultat.v6KRevele} niveauAide={resultat.niveauAideV6K} />
      <LigneEcran label="Moyenne x̄" score={resultat.scoreV6XBar} revele={resultat.v6XBarRevele} niveauAide={resultat.niveauAideV6XBar} />
      <LigneEcran label="% minimal (depuis le nombre donné)" score={resultat.scoreV7Pourcent0} revele={resultat.v7Pourcent0Revele} niveauAide={resultat.niveauAideV7Pourcent0} />
      <LigneEcran label="k" score={resultat.scoreV7K} revele={resultat.v7KRevele} niveauAide={resultat.niveauAideV7K} />
      <LigneEcran label="Écart-type σ" score={resultat.scoreV7Sigma} revele={resultat.v7SigmaRevele} niveauAide={resultat.niveauAideV7Sigma} />
      <LigneEcran label="% minimal (depuis le nombre donné)" score={resultat.scoreV8Pourcent0} revele={resultat.v8Pourcent0Revele} niveauAide={resultat.niveauAideV8Pourcent0} />
      <LigneEcran label="k" score={resultat.scoreV8K} revele={resultat.v8KRevele} niveauAide={resultat.niveauAideV8K} />
      <LigneEcran label="Moyenne x̄" score={resultat.scoreV8XBar} revele={resultat.v8XBarRevele} niveauAide={resultat.niveauAideV8XBar} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreV1K === 0 && exercice.variante === "intervalleVersPourcent" && (
        <div className="answer-reveal">k attendu : {formatKAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV1Pourcent === 0 && exercice.variante === "intervalleVersPourcent" && (
        <div className="answer-reveal">% minimal attendu : {formatPourcentAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV2K === 0 && exercice.variante === "pourcentVersIntervalle" && (
        <div className="answer-reveal">k attendu : {formatKAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV2Intervalle === 0 && exercice.variante === "pourcentVersIntervalle" && (
        <div className="answer-reveal">Intervalle attendu : {formatIntervalleAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV3K === 0 && exercice.variante === "intervalleVersNombre" && (
        <div className="answer-reveal">k attendu : {formatKAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV3Pourcent === 0 && exercice.variante === "intervalleVersNombre" && (
        <div className="answer-reveal">% minimal attendu : {formatPourcentAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV3Nombre === 0 && exercice.variante === "intervalleVersNombre" && (
        <div className="answer-reveal">Nombre minimal attendu : {formatNombreAttenduTexte(exercice.nMinAttendu)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV4Pourcent0 === 0 && exercice.variante === "nombreVersIntervalle" && (
        <div className="answer-reveal">% minimal attendu : {formatPourcentDepuisNombreAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV4K === 0 && exercice.variante === "nombreVersIntervalle" && (
        <div className="answer-reveal">k attendu : {formatKAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV4Intervalle === 0 && exercice.variante === "nombreVersIntervalle" && (
        <div className="answer-reveal">Intervalle attendu : {formatIntervalleAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV5K === 0 && exercice.variante === "intervalleVersSigma" && (
        <div className="answer-reveal">k attendu : {formatKAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV5Sigma === 0 && exercice.variante === "intervalleVersSigma" && (
        <div className="answer-reveal">σ attendu : {formatSigmaAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV6K === 0 && exercice.variante === "intervalleVersXBar" && (
        <div className="answer-reveal">k attendu : {formatKAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV6XBar === 0 && exercice.variante === "intervalleVersXBar" && (
        <div className="answer-reveal">x̄ attendu : {formatXBarAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV7Pourcent0 === 0 && exercice.variante === "nombreVersSigma" && (
        <div className="answer-reveal">% minimal attendu : {formatPourcentDepuisNombreAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV7K === 0 && exercice.variante === "nombreVersSigma" && (
        <div className="answer-reveal">k attendu : {formatKAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV7Sigma === 0 && exercice.variante === "nombreVersSigma" && (
        <div className="answer-reveal">σ attendu : {formatSigmaAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV8Pourcent0 === 0 && exercice.variante === "nombreVersXBar" && (
        <div className="answer-reveal">% minimal attendu : {formatPourcentDepuisNombreAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV8K === 0 && exercice.variante === "nombreVersXBar" && (
        <div className="answer-reveal">k attendu : {formatKAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreV8XBar === 0 && exercice.variante === "nombreVersXBar" && (
        <div className="answer-reveal">x̄ attendu : {formatXBarAttenduTexte(exercice)}</div>
      )}

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
