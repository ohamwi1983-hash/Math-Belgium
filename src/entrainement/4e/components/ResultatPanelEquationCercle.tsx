import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import type { ResultatExerciceEquationCercle } from "../moteur/typesEquationCercle";
import { LIBELLE_VARIANTE, formatEquationAttendueLatex, formatEtatActuelCentreLatex } from "../ui/formatEquationCercle";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceEquationCercle;
  exercice: ExerciceEquationCercle;
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
 * conversion que `ResultatPanelCercleTrigonometrique.tsx`. Les 3 scores sont toujours des `number`
 * (jamais `null`), ce générateur n'ayant structurellement aucune étape sautable (même simplicité
 * que "Relations entre droites"). `niveauAide`/`revele` capturés au moment de la clôture de chaque
 * écran côté moteur (jamais dérivés du score seul) : une tentative ratée sans aide reste donc
 * verte.
 */
export function ResultatPanelEquationCercle({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreCentre + resultat.scoreRayon + resultat.scoreEquation;
  const maxPoints = 300;

  return (
    <div>
      <h2 className="result-title">Équation d'un cercle</h2>
      <p className="result-subtitle">{LIBELLE_VARIANTE[resultat.variante]} — résultat de l'exercice</p>
      <LigneEcran label="Centre" revele={resultat.centreRevele} aideUtilisee={resultat.centreAideUtilisee} />
      <LigneEcran label="Rayon" revele={resultat.rayonRevele} aideUtilisee={resultat.rayonAideUtilisee} />
      <LigneEcran label="Équation" revele={resultat.equationRevele} aideUtilisee={resultat.equationAideUtilisee} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreCentre === 0 && (
        <div className="answer-reveal">
          Centre attendu : <Katex expression={formatEtatActuelCentreLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreRayon === 0 && (
        <div className="answer-reveal">
          Rayon attendu : <Katex expression={`R = ${exercice.rayon}`} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreEquation === 0 && (
        <div className="answer-reveal">
          Équation attendue : <Katex expression={formatEquationAttendueLatex(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
