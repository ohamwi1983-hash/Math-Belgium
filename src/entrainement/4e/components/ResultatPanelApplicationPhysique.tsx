import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import type { ResultatExerciceApplicationPhysique } from "../moteur/typesApplicationPhysique";
import { libelleContexteApplicationPhysique, notationVecteursApplicationPhysique } from "../ui/formatApplicationPhysique";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceApplicationPhysique;
  exercice: ExerciceApplicationPhysique;
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
 * `revele`/`aideUtilisee` capturés au moment de la clôture de chaque écran côté moteur
 * (`sessionApplicationPhysique.ts`), jamais dérivés du score seul : une tentative ratée sans aide
 * reste donc verte. Seul l'écran "norme" a une aide progressive — les 3 autres écrans passent
 * toujours `aideUtilisee={false}`, jamais orange.
 */
export function ResultatPanelApplicationPhysique({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const { v1, resultante, normeResultante } = notationVecteursApplicationPhysique(exercice.contexte);
  const totalPoints = resultat.scoreModelisation + resultat.scoreNorme + resultat.scoreDeviation + resultat.scoreInterpretation;

  return (
    <div>
      <h2 className="result-title">{libelleContexteApplicationPhysique(exercice.contexte)}</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Configuration" revele={resultat.modelisationRevele} aideUtilisee={false} />
      <LigneEcran label="Norme de la résultante" revele={resultat.normeRevele} aideUtilisee={resultat.normeAideUtilisee} />
      <LigneEcran label="Angle de déviation" revele={resultat.deviationRevele} aideUtilisee={false} />
      <LigneEcran label="Interprétation" revele={resultat.interpretationRevele} aideUtilisee={false} />
      <TotalPointsRecap points={totalPoints} maxPoints={400} />
      {afficherReponseApresEchec && (resultat.scoreNorme === 0 || resultat.scoreDeviation === 0 || resultat.scoreInterpretation === 0) && (
        <div className="answer-reveal">
          Norme attendue (<Katex expression={normeResultante} />) : {Math.round(exercice.triangle.a * 100) / 100} {exercice.unite} —
          Déviation attendue (angle entre <Katex expression={v1} /> et <Katex expression={resultante} />) :{" "}
          {Math.round(exercice.triangle.C * 100) / 100}° — Direction attendue : {exercice.directionCorrecte}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
