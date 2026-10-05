import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import type { ResultatExerciceEquationDroite } from "../moteur/typesEquationDroite";
import {
  LATEX_GABARIT_FORME,
  formatAideCoefficientsNiveau2Latex,
  formatEquationExpliciteXLatex,
  formatEquationExpliciteYLatex,
  formatEquationImpliciteLatex,
  formatEtatActuelPointVecteurLatex,
} from "../ui/formatEquationDroite";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceEquationDroite;
  exercice: ExerciceEquationDroite;
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

/** Révélation des coefficients — toujours la vraie référence de l'exercice (`refExpliciteY`/
 * `refExpliciteX`/`referenceImplicite`/le point+vecteur pour paramétrique), jamais la saisie de
 * l'élève. Réutilisée à la fois pour l'ancienne révélation "Coefficients attendus" (formes
 * "implicite"/"parametrique") et pour la révélation de l'écran fusionné (formes explicite_y/
 * explicite_x, `promptgen42modificationsv2.md` partie A) : le repli final (forme implicite) couvre
 * le cas `!exercice.possible`, seule réponse valide attendue dans ce cas. */
function revelationCoefficients(exercice: ExerciceEquationDroite) {
  const forme = exercice.formeCible;
  if (forme === "parametrique") {
    return <Katex expression={formatEtatActuelPointVecteurLatex(exercice)} />;
  }
  if (forme === "implicite") {
    const { a, b, c } = exercice.referenceImplicite;
    return <Katex expression={formatEquationImpliciteLatex(a, b, c)} />;
  }
  if (forme === "explicite_y" && exercice.refExpliciteY !== null) {
    const { m, p } = exercice.refExpliciteY;
    return <Katex expression={formatEquationExpliciteYLatex(m, p)} />;
  }
  if (forme === "explicite_x" && exercice.refExpliciteX !== null) {
    const { n, q } = exercice.refExpliciteX;
    return <Katex expression={formatEquationExpliciteXLatex(n, q)} />;
  }
  // Forme demandée structurellement impossible pour cette instance (`!exercice.possible`) — repli
  // sur la forme implicite, toujours calculable, seule réponse valide attendue dans ce cas.
  const { a, b, c } = exercice.referenceImplicite;
  return <Katex expression={formatEquationImpliciteLatex(a, b, c)} />;
}

export function ResultatPanelEquationDroite({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [resultat.scoreExtraction, resultat.scorePossibilite, resultat.scoreCoefficients, resultat.scorePossibiliteCoefficients].filter(
    (score): score is number => score !== null,
  );
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Équation d'une droite</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Extraction (point + vecteur directeur)" revele={resultat.extractionRevele} aideUtilisee={resultat.extractionAideUtilisee} />
      {resultat.scorePossibilite !== null && <LigneEcran label="Possibilité de la forme" revele={resultat.possibiliteRevele} aideUtilisee={false} />}
      {resultat.scoreCoefficients !== null && (
        <LigneEcran label="Coefficients" revele={resultat.coefficientsRevele} aideUtilisee={resultat.coefficientsAideUtilisee} />
      )}
      {resultat.scorePossibiliteCoefficients !== null && (
        <LigneEcran
          label="Possibilité et équation"
          revele={resultat.possibiliteCoefficientsRevele}
          aideUtilisee={resultat.possibiliteCoefficientsAideUtilisee}
        />
      )}
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreExtraction === 0 && (
        <div className="answer-reveal">
          Point/vecteur attendus : <Katex expression={formatEtatActuelPointVecteurLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scorePossibilite === 0 && (
        <div className="answer-reveal">
          Réponse attendue : {exercice.possible ? "Possible" : "Impossible"} — gabarit :{" "}
          <Katex expression={LATEX_GABARIT_FORME[exercice.formeCible]} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCoefficients === 0 && (
        <div className="answer-reveal">
          Coefficients attendus : {revelationCoefficients(exercice)}
          <br />
          Méthode : <Katex expression={formatAideCoefficientsNiveau2Latex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scorePossibiliteCoefficients === 0 && (
        <div className="answer-reveal">
          Réponse attendue : {exercice.possible ? "Possible" : "Impossible"} — équation : {revelationCoefficients(exercice)}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
