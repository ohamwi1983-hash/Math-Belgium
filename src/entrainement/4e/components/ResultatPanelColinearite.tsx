import type { ExerciceColinearite } from "../core/colinearite.types";
import type { ResultatExerciceColinearite } from "../moteur/typesColinearite";
import { conclusionAttendue, critereReel } from "../moteur/verificationColinearite";
import { formatComposantesLinMatriceLatex, formatComposantesMatriceLatex, formatEquationReduiteLatex, LIBELLES_OUI_NON } from "../ui/formatColinearite";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceColinearite;
  exercice: ExerciceColinearite;
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

/** Révélation de la construction (V3/V4-écran1) — les vraies composantes de AB/AC, jamais la
 * saisie de l'élève. Notation matricielle colonne, comme le bloc "État actuel" de l'écran suivant
 * (`etatActuelTestPoints`/`etatActuelReductionAvecX`) — même vecteur, même notation partout dans
 * ce générateur (correction transversale : ce panneau était resté en notation ligne, ajoutée avant
 * que le bloc "État actuel" ne passe en notation colonne). */
function revelationConstruction(exercice: ExerciceColinearite) {
  if (exercice.variante === "points") {
    return (
      <Katex
        expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurAC)} \\end{gathered}`}
      />
    );
  }
  if (exercice.variante === "pointsParametre") {
    return (
      <Katex
        expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAC)} \\end{gathered}`}
      />
    );
  }
  return null;
}

/** Révélation de la résolution (V2/V4 dernier écran) — les 3 cas (unique/identité/contradiction). */
function revelationResolution(exercice: ExerciceColinearite) {
  if (exercice.variante !== "parametre" && exercice.variante !== "pointsParametre") return null;
  if (exercice.typeSolution === "unique") return <Katex expression={`x = ${exercice.solutionX}`} />;
  if (exercice.typeSolution === "identite") return <span>Tout x convient (une infinité de solutions).</span>;
  return <span>Aucun x ne convient (aucune solution).</span>;
}

export function ResultatPanelColinearite({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const estTest = exercice.variante === "vecteurs" || exercice.variante === "points";
  const estAvecX = exercice.variante === "parametre" || exercice.variante === "pointsParametre";

  const scores = [resultat.scoreConstruction, resultat.scoreReduction, resultat.scoreResolution, resultat.scoreTest].filter(
    (score): score is number => score !== null,
  );
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Colinéarité et alignement de points</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreConstruction !== null && (
        <LigneEcran label="Construction des vecteurs" revele={resultat.constructionRevele} niveauAide={resultat.niveauAideConstruction} />
      )}
      {resultat.scoreReduction !== null && (
        <LigneEcran label="Réduction" revele={resultat.reductionRevele} niveauAide={resultat.niveauAideReduction} />
      )}
      {resultat.scoreResolution !== null && (
        <LigneEcran label="Résolution" revele={resultat.resolutionRevele} niveauAide={resultat.niveauAideResolution} />
      )}
      {resultat.scoreTest !== null && <LigneEcran label="Test de colinéarité" revele={resultat.testRevele} niveauAide={resultat.niveauAideTest} />}
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreConstruction === 0 && <div className="answer-reveal">{revelationConstruction(exercice)}</div>}
      {afficherReponseApresEchec && resultat.scoreReduction === 0 && estAvecX && (
        <div className="answer-reveal">
          Équation attendue : <Katex expression={formatEquationReduiteLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreResolution === 0 && (
        <div className="answer-reveal">Solution attendue : {revelationResolution(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreTest === 0 && estTest && (
        <div className="answer-reveal">
          Critère attendu : {critereReel(exercice)} — Conclusion attendue :{" "}
          {conclusionAttendue(exercice) ? LIBELLES_OUI_NON.positif : LIBELLES_OUI_NON.negatif}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
