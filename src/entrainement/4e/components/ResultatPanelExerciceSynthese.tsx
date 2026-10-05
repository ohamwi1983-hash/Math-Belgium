import type { ExerciceSynthese } from "../core/exerciceSynthese.types";
import type { ResultatExerciceSynthese } from "../moteur/typesExerciceSynthese";
import {
  versBoiteMoustaches,
  versDispersion,
  versMedianeClasses,
  versMedianeDiscrete,
  versMoyennePondereeClasses,
  versMoyennePonderee,
} from "../moteur/verificationExerciceSynthese";
import { formatEcartTypeAttendueTexte, formatTableauAttenduTexte, formatVarianceAttendueTexte } from "../ui/formatDispersion";
import { formatTermesCinqNombresLatex } from "../ui/formatBoiteMoustaches";
import {
  formatLectureAttendueTexte,
  formatMedianeAttendueTexte,
  formatMinMaxModeAttendueTexte,
  formatPolygoneAttenduTexte,
  formatQ1AttendueTexte,
  formatQ3AttendueTexte,
  formatSyntheseAttendueTexte,
  LABEL_X_MAX,
  LABEL_X_MIN,
} from "../ui/formatMediane";
import { formatCentresAttendusTexte, formatSommesAttenduesTexte } from "../ui/formatMoyennePonderee";
import { formatBtIntervalleAttenduTexte, formatBtPourcentAttenduTexte, libelleVarianteExerciceSynthese } from "../ui/formatExerciceSynthese";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  resultat: ResultatExerciceSynthese;
  exercice: ExerciceSynthese;
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
 * Panneau de résultat — "Exercice de synthèse" (chapitre 5, remplace "Étendue et écart
 * interquartile" à la même position, gen35 — `promptgen35synthese.md`).
 *
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final", point 10 de l'audit chapitre 5) — remplace l'ancien format
 * `score-list`/`X/100` par écran. 17 lignes potentielles (au plus 11 non-`null` simultanément,
 * variante `discrete` ; 13, variante `classes`), chacune rendue `null` par `LigneEcran` si son
 * champ `score` est `null` — même principe que "Paramètres de position"/"Inégalité de
 * Bienaymé-Tchebychev". `niveauAide`/`revele` déjà capturés côté moteur (`ResultatExerciceSynthese`)
 * au moment précis de la clôture de chaque écran — jamais dérivés du score seul, une tentative
 * ratée sans aide reste donc verte. Chaque révélation de réponse (bloc `answer-reveal`) réutilise
 * **directement** la fonction de révélation du générateur SOURCE (gen32/33/34/36), appliquée à
 * l'objet MAPPÉ — jamais une seconde logique de formatage dupliquée ici, même principe que la
 * vérification (`sessionExerciceSynthese.ts`) et la présentation des 15 écrans repris tels quels.
 */
export function ResultatPanelExerciceSynthese({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [
    resultat.scoreCentres,
    resultat.scoreSommes,
    resultat.scoreQuotient,
    resultat.scoreMediane,
    resultat.scoreQ1,
    resultat.scoreQ3,
    resultat.scoreMinMaxMode,
    resultat.scorePolygone,
    resultat.scoreLectureMediane,
    resultat.scoreLectureQ1,
    resultat.scoreLectureQ3,
    resultat.scoreSynthese,
    resultat.scoreBoxplot,
    resultat.scoreTableau,
    resultat.scoreVarianceEcartType,
    resultat.scoreBtIntervalle,
    resultat.scoreBtPourcent,
  ].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Synthèse — Statistique descriptive complète</h2>
      <p className="result-subtitle">{libelleVarianteExerciceSynthese(resultat.variante)}</p>
      <LigneEcran label="Centres de classe" score={resultat.scoreCentres} revele={resultat.centresRevele} niveauAide={resultat.niveauAideCentres} />
      <LigneEcran label="Sommes intermédiaires" score={resultat.scoreSommes} revele={resultat.sommesRevele} niveauAide={resultat.niveauAideSommes} />
      <LigneEcran label="Moyenne pondérée (quotient)" score={resultat.scoreQuotient} revele={resultat.quotientRevele} niveauAide={resultat.niveauAideQuotient} />
      <LigneEcran label="Médiane" score={resultat.scoreMediane} revele={resultat.medianeRevele} niveauAide={resultat.niveauAideMediane} />
      <LigneEcran label="Premier quartile (Q1)" score={resultat.scoreQ1} revele={resultat.q1Revele} niveauAide={resultat.niveauAideQ1} />
      <LigneEcran label="Troisième quartile (Q3)" score={resultat.scoreQ3} revele={resultat.q3Revele} niveauAide={resultat.niveauAideQ3} />
      <LigneEcran label="Min, max et mode(s)" score={resultat.scoreMinMaxMode} revele={resultat.minMaxModeRevele} niveauAide={resultat.niveauAideMinMaxMode} />
      <LigneEcran label="Polygone des effectifs cumulés" score={resultat.scorePolygone} revele={resultat.polygoneRevele} niveauAide={resultat.niveauAidePolygone} />
      <LigneEcran
        label="Lecture — médiane"
        score={resultat.scoreLectureMediane}
        revele={resultat.lectureMedianeRevele}
        niveauAide={resultat.niveauAideLectureMediane}
      />
      <LigneEcran label="Lecture — Q1" score={resultat.scoreLectureQ1} revele={resultat.lectureQ1Revele} niveauAide={resultat.niveauAideLectureQ1} />
      <LigneEcran label="Lecture — Q3" score={resultat.scoreLectureQ3} revele={resultat.lectureQ3Revele} niveauAide={resultat.niveauAideLectureQ3} />
      <LigneEcran label="Synthèse (classe modale)" score={resultat.scoreSynthese} revele={resultat.syntheseRevele} niveauAide={resultat.niveauAideSynthese} />
      <LigneEcran label="Boîte à moustaches" score={resultat.scoreBoxplot} revele={resultat.boxplotRevele} niveauAide={resultat.niveauAideBoxplot} />
      <LigneEcran label="Tableau et sommes (variance)" score={resultat.scoreTableau} revele={resultat.tableauRevele} niveauAide={resultat.niveauAideTableau} />
      <LigneEcran
        label="Variance et écart-type"
        score={resultat.scoreVarianceEcartType}
        revele={resultat.varianceEcartTypeRevele}
        niveauAide={resultat.niveauAideVarianceEcartType}
      />
      <LigneEcran
        label="Bienaymé-Tchebychev — intervalle"
        score={resultat.scoreBtIntervalle}
        revele={resultat.btIntervalleRevele}
        niveauAide={resultat.niveauAideBtIntervalle}
      />
      <LigneEcran
        label="Bienaymé-Tchebychev — % minimal"
        score={resultat.scoreBtPourcent}
        revele={resultat.btPourcentRevele}
        niveauAide={resultat.niveauAideBtPourcent}
      />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreCentres === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Centres attendus : {formatCentresAttendusTexte(versMoyennePondereeClasses(exercice))}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreSommes === 0 && (
        <div className="answer-reveal">
          Sommes attendues : <SegmentsInline segments={formatSommesAttenduesTexte(versMoyennePonderee(exercice))} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreQuotient === 0 && (
        <div className="answer-reveal">Moyenne pondérée attendue : {exercice.xBar}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreMediane === 0 && exercice.variante === "discrete" && (
        <div className="answer-reveal">Médiane attendue : {formatMedianeAttendueTexte(versMedianeDiscrete(exercice))}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreQ1 === 0 && exercice.variante === "discrete" && (
        <div className="answer-reveal">Q1 attendu : {formatQ1AttendueTexte(versMedianeDiscrete(exercice))}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreQ3 === 0 && exercice.variante === "discrete" && (
        <div className="answer-reveal">Q3 attendu : {formatQ3AttendueTexte(versMedianeDiscrete(exercice))}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreMinMaxMode === 0 && exercice.variante === "discrete" && (
        <div className="answer-reveal">Min/max/mode(s) attendus : {formatMinMaxModeAttendueTexte(versMedianeDiscrete(exercice))}</div>
      )}
      {afficherReponseApresEchec && resultat.scorePolygone === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Polygone attendu : {formatPolygoneAttenduTexte(versMedianeClasses(exercice))}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreLectureMediane === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Médiane attendue (lecture) : {formatLectureAttendueTexte(versMedianeClasses(exercice), "mediane")}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreLectureQ1 === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Q1 attendu (lecture) : {formatLectureAttendueTexte(versMedianeClasses(exercice), "q1")}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreLectureQ3 === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Q3 attendu (lecture) : {formatLectureAttendueTexte(versMedianeClasses(exercice), "q3")}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreSynthese === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">
          Synthèse attendue : <Katex expression={LABEL_X_MIN} /> = {exercice.xMin}, <Katex expression={LABEL_X_MAX} /> = {exercice.xMax},{" "}
          {formatSyntheseAttendueTexte(versMedianeClasses(exercice))}
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreBoxplot === 0 && (
        <div className="answer-reveal">
          Réponse attendue :{" "}
          <span className="equation-box-termes">
            {formatTermesCinqNombresLatex(versBoiteMoustaches(exercice).valeurs).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreTableau === 0 && (
        <div className="answer-reveal">
          Sommes attendues : <SegmentsInline segments={formatTableauAttenduTexte(versDispersion(exercice))} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreVarianceEcartType === 0 && (
        <div className="answer-reveal">
          Variance attendue : {formatVarianceAttendueTexte(versDispersion(exercice))}, écart-type attendu :{" "}
          {formatEcartTypeAttendueTexte(versDispersion(exercice))}
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreBtIntervalle === 0 && (
        <div className="answer-reveal">Intervalle attendu : {formatBtIntervalleAttenduTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreBtPourcent === 0 && (
        <div className="answer-reveal">% minimal attendu : {formatBtPourcentAttenduTexte(exercice)}</div>
      )}

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
