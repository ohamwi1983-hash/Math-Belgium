import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import type { ResultatExerciceEquationCercleDeveloppee } from "../moteur/typesEquationCercleDeveloppee";
import {
  LIBELLE_VARIANTE,
  formatCentreAttenduLatex,
  formatCompletionLatex,
  formatRayonAttenduLatex,
  formatRegroupementLatex,
} from "../ui/formatEquationCercleDeveloppee";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceEquationCercleDeveloppee;
  exercice: ExerciceEquationCercleDeveloppee;
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
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran, même
 * conversion que `ResultatPanelCercleTrigonometrique.tsx`/`ResultatPanelEquationCercle.tsx`. Les 3
 * scores sont toujours des `number` (jamais `null`), ce générateur n'ayant structurellement aucune
 * étape sautable (même simplicité que "Équation d'un cercle... à partir d'un graphe`).
 * `niveauAide`/`revele` capturés au moment de la clôture de chaque écran côté moteur (jamais
 * dérivés du score seul) : une tentative ratée sans aide reste donc verte.
 */
export function ResultatPanelEquationCercleDeveloppee({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreRegroupement + resultat.scoreCompletion + resultat.scoreCentreRayon;
  const maxPoints = 300;

  return (
    <div>
      <h2 className="result-title">Centre et rayon d'un cercle</h2>
      <p className="result-subtitle">{LIBELLE_VARIANTE[resultat.variante]} — résultat de l'exercice</p>
      <LigneEcran label="Regroupement" revele={resultat.regroupementRevele} aideUtilisee={resultat.regroupementAideUtilisee} />
      <LigneEcran label="Complétion du carré" revele={resultat.completionRevele} aideUtilisee={resultat.completionAideUtilisee} />
      <LigneEcran label="Centre et rayon" revele={resultat.centreRayonRevele} aideUtilisee={resultat.centreRayonAideUtilisee} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreRegroupement === 0 && (
        <div className="answer-reveal">
          Regroupement attendu : <Katex expression={formatRegroupementLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCompletion === 0 && (
        <div className="answer-reveal">
          Complétion attendue : <Katex expression={formatCompletionLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCentreRayon === 0 && (
        <div className="answer-reveal">
          Centre attendu : <Katex expression={formatCentreAttenduLatex(exercice)} /> — Rayon attendu :{" "}
          <Katex expression={`R = ${formatRayonAttenduLatex(exercice)}`} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
