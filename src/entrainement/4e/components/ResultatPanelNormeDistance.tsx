import type { ExerciceNormeDistance } from "../core/normeDistance.types";
import type { ResultatExerciceNormeDistance } from "../moteur/typesNormeDistance";
import { sommetAttenduPythagore } from "../moteur/verificationNormeDistance";
import {
  formatEquationReduiteParametreNormeLatex,
  formatLongueurIrreductibleLatex,
  formatSolutionsAttenduesTexte,
  formatVecteurLatex,
  libelleRectangleEn,
} from "../ui/formatNormeDistance";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceNormeDistance;
  exercice: ExerciceNormeDistance;
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
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention CLAUDE.md
 * "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran, même patron que
 * `ResultatPanelCercleTrigonometrique.tsx`. `niveauAideXxx`/`xxxRevele` déjà capturés au moment de la
 * clôture de chaque écran côté moteur (jamais dérivés du score seul).
 */
export function ResultatPanelNormeDistance({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [
    resultat.scoreNormeVecteur,
    resultat.scoreConstructionDistance,
    resultat.scoreCalculDistance,
    resultat.scoreConstructionIsocele,
    resultat.scoreCalculIsocele,
    resultat.scoreConclusionIsocele,
    resultat.scoreReductionParametreNorme,
    resultat.scoreResolutionParametreNorme,
    resultat.scoreConstructionPythagore,
    resultat.scoreCalculPythagore,
    resultat.scoreTestPythagore,
  ].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Norme d'un vecteur et distance entre 2 points</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreNormeVecteur !== null && <LigneEcran label="Norme" revele={resultat.normeVecteurRevele} niveauAide={resultat.niveauAideNormeVecteur} />}
      {resultat.scoreConstructionDistance !== null && (
        <LigneEcran label="Construction du vecteur" revele={resultat.constructionDistanceRevele} niveauAide={resultat.niveauAideConstructionDistance} />
      )}
      {resultat.scoreCalculDistance !== null && (
        <LigneEcran label="Calcul de la distance" revele={resultat.calculDistanceRevele} niveauAide={resultat.niveauAideCalculDistance} />
      )}
      {resultat.scoreConstructionIsocele !== null && (
        <LigneEcran label="Construction des côtés" revele={resultat.constructionIsoceleRevele} niveauAide={resultat.niveauAideConstructionIsocele} />
      )}
      {resultat.scoreCalculIsocele !== null && (
        <LigneEcran label="Calcul des longueurs" revele={resultat.calculIsoceleRevele} niveauAide={resultat.niveauAideCalculIsocele} />
      )}
      {resultat.scoreConclusionIsocele !== null && (
        <LigneEcran label="Conclusion" revele={resultat.conclusionIsoceleRevele} niveauAide={resultat.niveauAideConclusionIsocele} />
      )}
      {resultat.scoreReductionParametreNorme !== null && (
        <LigneEcran label="Réduction" revele={resultat.reductionParametreNormeRevele} niveauAide={resultat.niveauAideReductionParametreNorme} />
      )}
      {resultat.scoreResolutionParametreNorme !== null && (
        <LigneEcran label="Résolution" revele={resultat.resolutionParametreNormeRevele} niveauAide={resultat.niveauAideResolutionParametreNorme} />
      )}
      {resultat.scoreConstructionPythagore !== null && (
        <LigneEcran label="Construction des côtés" revele={resultat.constructionPythagoreRevele} niveauAide={resultat.niveauAideConstructionPythagore} />
      )}
      {resultat.scoreCalculPythagore !== null && (
        <LigneEcran label="Calcul des longueurs" revele={resultat.calculPythagoreRevele} niveauAide={resultat.niveauAideCalculPythagore} />
      )}
      {resultat.scoreTestPythagore !== null && <LigneEcran label="Rectangle en..." revele={resultat.testPythagoreRevele} niveauAide={resultat.niveauAideTestPythagore} />}
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreNormeVecteur === 0 && exercice.variante === "vecteur" && (
        <div className="answer-reveal">Norme attendue : {exercice.norme}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreConstructionDistance === 0 && exercice.variante === "distance" && (
        <div className="answer-reveal">
          <Katex expression={formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, exercice.vecteurAB)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCalculDistance === 0 && exercice.variante === "distance" && (
        <div className="answer-reveal">Distance attendue : {exercice.distance}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreConstructionIsocele === 0 && exercice.variante === "isocele" && (
        <div className="answer-reveal">
          <Katex
            expression={`\\begin{gathered} ${formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, exercice.vecteurAB)} \\\\ ${formatVecteurLatex(`${exercice.labelA}${exercice.labelC}`, exercice.vecteurAC)} \\\\ ${formatVecteurLatex(`${exercice.labelB}${exercice.labelC}`, exercice.vecteurBC)} \\end{gathered}`}
          />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCalculIsocele === 0 && exercice.variante === "isocele" && (
        <div className="answer-reveal">
          {exercice.labelA}
          {exercice.labelB} = {exercice.longueurAB} — {exercice.labelA}
          {exercice.labelC} = {exercice.longueurAC} — {exercice.labelB}
          {exercice.labelC} = {exercice.longueurBC}
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreConclusionIsocele === 0 && exercice.variante === "isocele" && (
        <div className="answer-reveal">
          Conclusion attendue :{" "}
          {exercice.classification === "scalene"
            ? "Scalène"
            : `Isocèle en ${exercice.classification === "isoceleA" ? exercice.labelA : exercice.classification === "isoceleB" ? exercice.labelB : exercice.labelC}`}
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreReductionParametreNorme === 0 && exercice.variante === "parametre" && (
        <div className="answer-reveal">
          Équation attendue : <Katex expression={formatEquationReduiteParametreNormeLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreResolutionParametreNorme === 0 && exercice.variante === "parametre" && (
        <div className="answer-reveal">Solution(s) attendue(s) : {formatSolutionsAttenduesTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreConstructionPythagore === 0 && exercice.variante === "pythagore" && (
        <div className="answer-reveal">
          <Katex
            expression={`\\begin{gathered} ${formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, exercice.vecteurAB)} \\\\ ${formatVecteurLatex(`${exercice.labelA}${exercice.labelC}`, exercice.vecteurAC)} \\\\ ${formatVecteurLatex(`${exercice.labelB}${exercice.labelC}`, exercice.vecteurBC)} \\end{gathered}`}
          />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCalculPythagore === 0 && exercice.variante === "pythagore" && (
        <div className="answer-reveal">
          <Katex
            expression={`\\begin{gathered} \\|\\vec{${exercice.labelA}${exercice.labelB}}\\|=${formatLongueurIrreductibleLatex(exercice.carreAB)} \\\\ \\|\\vec{${exercice.labelA}${exercice.labelC}}\\|=${formatLongueurIrreductibleLatex(exercice.carreAC)} \\\\ \\|\\vec{${exercice.labelB}${exercice.labelC}}\\|=${formatLongueurIrreductibleLatex(exercice.carreBC)} \\end{gathered}`}
          />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreTestPythagore === 0 && exercice.variante === "pythagore" && (
        <div className="answer-reveal">
          Conclusion attendue :{" "}
          {sommetAttenduPythagore(exercice) === null ? "aucun sommet rectangle" : libelleRectangleEn(sommetAttenduPythagore(exercice) as "A" | "B" | "C", exercice)}
        </div>
      )}

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
