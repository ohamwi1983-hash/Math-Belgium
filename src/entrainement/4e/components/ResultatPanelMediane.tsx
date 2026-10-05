import type { ExerciceMediane } from "../core/mediane.types";
import type { ResultatExerciceMediane } from "../moteur/typesMediane";
import {
  LABEL_X_MAX,
  LABEL_X_MIN,
  formatLectureAttendueTexte,
  formatMedianeAttendueTexte,
  formatMinMaxModeAttendueTexte,
  formatPolygoneAttenduTexte,
  formatQ1AttendueTexte,
  formatQ3AttendueTexte,
  formatSyntheseAttendueTexte,
} from "../ui/formatMediane";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceMediane;
  exercice: ExerciceMediane;
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
 * `niveauAide`/`revele` déjà capturés côté moteur (`ResultatExerciceMediane`) au moment précis de la
 * clôture de chaque écran — jamais dérivés du score seul, une tentative ratée sans aide reste donc
 * verte. Une ligne par écran RÉELLEMENT atteint pour cette instance (`score !== null` — l'autre
 * variante n'a jamais traversé cet écran), même principe que "Cercle trigonométrique".
 */
export function ResultatPanelMediane({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [
    resultat.scoreMediane,
    resultat.scoreQ1,
    resultat.scoreQ3,
    resultat.scoreMinMaxMode,
    resultat.scorePolygone,
    resultat.scoreLectureQ1,
    resultat.scoreLectureMediane,
    resultat.scoreLectureQ3,
    resultat.scoreSynthese,
  ].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Paramètres de position</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreMediane !== null && <LigneEcran label="Médiane" revele={resultat.medianeRevele} niveauAide={resultat.niveauAideMediane} />}
      {resultat.scoreQ1 !== null && <LigneEcran label="Premier quartile (Q1)" revele={resultat.q1Revele} niveauAide={resultat.niveauAideQ1} />}
      {resultat.scoreQ3 !== null && <LigneEcran label="Troisième quartile (Q3)" revele={resultat.q3Revele} niveauAide={resultat.niveauAideQ3} />}
      {resultat.scoreMinMaxMode !== null && (
        <LigneEcran label="Min, max et mode(s)" revele={resultat.minMaxModeRevele} niveauAide={resultat.niveauAideMinMaxMode} />
      )}
      {resultat.scorePolygone !== null && (
        <LigneEcran label="Polygone des effectifs cumulés" revele={resultat.polygoneRevele} niveauAide={resultat.niveauAidePolygone} />
      )}
      {resultat.scoreLectureQ1 !== null && (
        <LigneEcran label="Lecture — Q1" revele={resultat.lectureQ1Revele} niveauAide={resultat.niveauAideLectureQ1} />
      )}
      {resultat.scoreLectureMediane !== null && (
        <LigneEcran label="Lecture — médiane" revele={resultat.lectureMedianeRevele} niveauAide={resultat.niveauAideLectureMediane} />
      )}
      {resultat.scoreLectureQ3 !== null && (
        <LigneEcran label="Lecture — Q3" revele={resultat.lectureQ3Revele} niveauAide={resultat.niveauAideLectureQ3} />
      )}
      {resultat.scoreSynthese !== null && <LigneEcran label="Synthèse" revele={resultat.syntheseRevele} niveauAide={resultat.niveauAideSynthese} />}
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreMediane === 0 && exercice.variante === "discrete" && (
        <div className="answer-reveal">Réponse attendue : {formatMedianeAttendueTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreQ1 === 0 && exercice.variante === "discrete" && (
        <div className="answer-reveal">Q1 attendu : {formatQ1AttendueTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreQ3 === 0 && exercice.variante === "discrete" && (
        <div className="answer-reveal">Q3 attendu : {formatQ3AttendueTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreMinMaxMode === 0 && exercice.variante === "discrete" && (
        <div className="answer-reveal">Min/max/mode(s) attendus : {formatMinMaxModeAttendueTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scorePolygone === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Polygone attendu : {formatPolygoneAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreLectureQ1 === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Q1 attendu (lecture) : {formatLectureAttendueTexte(exercice, "q1")}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreLectureMediane === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Médiane attendue (lecture) : {formatLectureAttendueTexte(exercice, "mediane")}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreLectureQ3 === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Q3 attendu (lecture) : {formatLectureAttendueTexte(exercice, "q3")}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreSynthese === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">
          Synthèse attendue : <Katex expression={LABEL_X_MIN} /> = {exercice.xMin}, <Katex expression={LABEL_X_MAX} /> = {exercice.xMax},{" "}
          {formatSyntheseAttendueTexte(exercice)}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
