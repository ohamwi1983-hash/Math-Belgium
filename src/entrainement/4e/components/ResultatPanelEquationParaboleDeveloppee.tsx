import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import type { ResultatExerciceEquationParaboleDeveloppee } from "../moteur/typesEquationParaboleDeveloppee";
import {
  LIBELLE_VARIANTE,
  formatCompletionLatex,
  formatDirectriceLatex,
  formatFoyerLatex,
  formatRegroupementLatex,
  formatSommetLatex,
} from "../ui/formatEquationParaboleDeveloppee";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceEquationParaboleDeveloppee;
  exercice: ExerciceEquationParaboleDeveloppee;
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
 * Panneau de bilan — récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`,
 * convention CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par
 * écran. Les 3 scores sont toujours des `number` (jamais `null`), ce générateur n'ayant
 * structurellement aucune étape sautable (même simplicité que "Centre et rayon d'un cercle depuis
 * l'équation développée"). `niveauAide`/`revele` capturés au moment de la clôture de chaque écran
 * côté moteur (jamais dérivés du score seul) : une tentative ratée sans aide reste donc verte.
 */
export function ResultatPanelEquationParaboleDeveloppee({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreRegroupement + resultat.scoreCompletion + resultat.scoreCaracteristiques;
  const maxPoints = 300;

  return (
    <div>
      <h2 className="result-title">Sommet, foyer, p et directrice d'une parabole</h2>
      <p className="result-subtitle">{LIBELLE_VARIANTE[resultat.variante]} — résultat de l'exercice</p>
      <LigneEcran label="Regroupement" revele={resultat.regroupementRevele} aideUtilisee={resultat.regroupementAideUtilisee} />
      <LigneEcran label="Complétion du carré" revele={resultat.completionRevele} aideUtilisee={resultat.completionAideUtilisee} />
      <LigneEcran label="Caractéristiques" revele={resultat.caracteristiquesRevele} aideUtilisee={resultat.caracteristiquesAideUtilisee} />
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
      {afficherReponseApresEchec && resultat.scoreCaracteristiques === 0 && (
        <div className="answer-reveal">
          Sommet attendu : <Katex expression={formatSommetLatex(exercice.sommet)} /> — Foyer attendu :{" "}
          <Katex expression={formatFoyerLatex(exercice.foyer)} /> — p attendu : <Katex expression={`p = ${exercice.p}`} /> — Directrice attendue :{" "}
          <Katex expression={formatDirectriceLatex(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
