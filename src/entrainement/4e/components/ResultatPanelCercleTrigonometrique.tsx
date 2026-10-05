import type { ExerciceCercleTrigonometrique } from "../core/cercleTrigonometrique.types";
import type { ResultatExerciceCercleTrigonometrique } from "../moteur/typesCercleTrigonometrique";
import { libelleQuadrant, libelleVariante } from "../ui/formatCercleTrigonometrique";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceCercleTrigonometrique;
  exercice: ExerciceCercleTrigonometrique;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, aideUtilisee }: { label: string; revele: boolean; aideUtilisee: boolean }) {
  const statut = statutRecap(revele, aideUtilisee ? 1 : 0);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/**
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran.
 * `niveauAide`/`revele` capturés au moment de la clôture de chaque écran côté moteur (jamais
 * dérivés du score seul) : une tentative ratée sans aide reste donc verte. L'écran "Quadrant" n'a
 * jamais de bouton Aide (aucun bouton n'y a jamais existé) — toujours `aideUtilisee={false}`,
 * jamais orange. Une réponse attendue reste affichée pour CHAQUE étape échouée (score 0), pas
 * seulement la dernière.
 */
export function ResultatPanelCercleTrigonometrique({
  resultat,
  exercice,
  afficherReponseApresEchec,
  labelBouton,
  onContinuer,
}: Props) {
  const scores = [resultat.scoreReduction, resultat.scoreQuadrant, resultat.scoreAnglePremierQuadrant, resultat.scoreSignes].filter(
    (score): score is number => score !== null,
  );
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">{libelleVariante(resultat.variante)}</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreReduction !== null && (
        <LigneEcran label="Réduction" revele={resultat.reductionRevele} aideUtilisee={resultat.reductionAideUtilisee} />
      )}
      <LigneEcran label="Quadrant" revele={resultat.quadrantRevele} aideUtilisee={false} />
      <LigneEcran
        label="Angle du premier quadrant"
        revele={resultat.anglePremierQuadrantRevele}
        aideUtilisee={resultat.anglePremierQuadrantAideUtilisee}
      />
      <LigneEcran label="Signe de sin, cos, tan" revele={resultat.signesRevele} aideUtilisee={resultat.signesAideUtilisee} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreReduction === 0 && (
        <div className="answer-reveal">Angle réduit attendu : {exercice.angleReduit}°</div>
      )}
      {afficherReponseApresEchec && resultat.scoreQuadrant === 0 && (
        <div className="answer-reveal">Quadrant attendu : {libelleQuadrant(exercice.quadrant)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreAnglePremierQuadrant === 0 && (
        <div className="answer-reveal">Angle du premier quadrant attendu : {exercice.anglePremierQuadrant}°</div>
      )}
      {afficherReponseApresEchec && resultat.scoreSignes === 0 && (
        <div className="answer-reveal">
          Signes attendus : sin(θ) {exercice.signeSin} ; cos(θ) {exercice.signeCos} ; tan(θ){" "}
          {exercice.signeTan === "indefini" ? "∄" : exercice.signeTan}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
