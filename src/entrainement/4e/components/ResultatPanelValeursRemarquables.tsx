import type { ExerciceValeursRemarquables } from "../core/valeursRemarquables.types";
import type { ResultatExerciceValeursRemarquables } from "../moteur/typesValeursRemarquables";
import { libelleQuadrant } from "../ui/formatCercleTrigonometrique";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceValeursRemarquables;
  exercice: ExerciceValeursRemarquables;
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
 * `niveauAide`/`revele` capturés à la clôture de chaque écran côté moteur (jamais dérivés du score
 * seul) : une tentative ratée sans aide reste donc verte. Contrairement au générateur 14, les 3
 * écrans ont ici un bouton Aide.
 */
export function ResultatPanelValeursRemarquables({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreQuadrant + resultat.scoreAnglePremierQuadrant + resultat.scoreValeursExactes;

  return (
    <div>
      <h2 className="result-title">Valeurs trigonométriques remarquables — {resultat.anglePremierQuadrant}°</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Quadrant" revele={resultat.quadrantRevele} aideUtilisee={resultat.quadrantAideUtilisee} />
      <LigneEcran
        label="Angle du premier quadrant"
        revele={resultat.anglePremierQuadrantRevele}
        aideUtilisee={resultat.anglePremierQuadrantAideUtilisee}
      />
      <LigneEcran label="Valeurs exactes" revele={resultat.valeursExactesRevele} aideUtilisee={resultat.valeursExactesAideUtilisee} />
      <TotalPointsRecap points={totalPoints} maxPoints={300} />
      {afficherReponseApresEchec && resultat.scoreQuadrant === 0 && (
        <div className="answer-reveal">Quadrant attendu : {libelleQuadrant(exercice.quadrant)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreAnglePremierQuadrant === 0 && (
        <div className="answer-reveal">Angle du premier quadrant attendu : {exercice.anglePremierQuadrant}°</div>
      )}
      {afficherReponseApresEchec && resultat.scoreValeursExactes === 0 && (
        <div className="answer-reveal">
          Valeurs attendues : sin(θ) = <Katex expression={exercice.sinLatex} /> ; cos(θ) = <Katex expression={exercice.cosLatex} /> ;
          tan(θ) = {exercice.tanLatex === "n'existe pas" ? "n'existe pas" : <Katex expression={exercice.tanLatex} />}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
