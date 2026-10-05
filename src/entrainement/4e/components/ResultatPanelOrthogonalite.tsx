import type { ExerciceOrthogonalite, Sommet } from "../core/orthogonalite.types";
import type { ResultatExerciceOrthogonalite } from "../moteur/typesOrthogonalite";
import { conclusionAttendueTest, conclusionAttendueTriangle, conclusionAttendueTriangleParametre, critereReelTest } from "../moteur/verificationOrthogonalite";
import {
  LIBELLES_OUI_NON,
  formatComposantesLinMatriceLatex,
  formatComposantesMatriceLatex,
  formatEquationReduiteParametreLatex,
  formatReductionLatex,
  libelleRectangleEn,
} from "../ui/formatOrthogonalite";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceOrthogonalite;
  exercice: ExerciceOrthogonalite;
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

const SOMMETS: Sommet[] = ["A", "B", "C"];

function libelleSommetLettre(exercice: { labelA: string; labelB: string; labelC: string }, sommet: Sommet): string {
  return sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
}

function revelationConclusionSommetOuAucun(exercice: { labelA: string; labelB: string; labelC: string }, sommet: Sommet | null): string {
  return sommet === null ? "Pas rectangle" : libelleRectangleEn(sommet, exercice);
}

export function ResultatPanelOrthogonalite({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [
    resultat.scoreTest,
    resultat.scoreReductionParametre,
    resultat.scoreResolutionParametre,
    resultat.scoreConstructionTriangle,
    resultat.scoreTestSommetA,
    resultat.scoreTestSommetB,
    resultat.scoreTestSommetC,
    resultat.scoreConclusionTriangle,
    resultat.scoreConstructionAvecX,
    resultat.scoreReductionSommetA,
    resultat.scoreReductionSommetB,
    resultat.scoreReductionSommetC,
    resultat.scoreIdentificationResolution,
  ].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Orthogonalité et théorème de Pythagore généralisé</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreTest !== null && <LigneEcran label="Test d'orthogonalité" revele={resultat.testRevele} niveauAide={resultat.niveauAideTest} />}
      {resultat.scoreReductionParametre !== null && (
        <LigneEcran label="Réduction" revele={resultat.reductionParametreRevele} niveauAide={resultat.niveauAideReductionParametre} />
      )}
      {resultat.scoreResolutionParametre !== null && (
        <LigneEcran label="Résolution" revele={resultat.resolutionParametreRevele} niveauAide={resultat.niveauAideResolutionParametre} />
      )}
      {resultat.scoreConstructionTriangle !== null && (
        <LigneEcran label="Construction des vecteurs" revele={resultat.constructionTriangleRevele} niveauAide={resultat.niveauAideConstructionTriangle} />
      )}
      {exercice.variante === "triangle" &&
        SOMMETS.map((sommet) => {
          const score = sommet === "A" ? resultat.scoreTestSommetA : sommet === "B" ? resultat.scoreTestSommetB : resultat.scoreTestSommetC;
          if (score === null) return null;
          const revele = sommet === "A" ? resultat.testSommetARevele : sommet === "B" ? resultat.testSommetBRevele : resultat.testSommetCRevele;
          const niveauAide =
            sommet === "A" ? resultat.niveauAideTestSommetA : sommet === "B" ? resultat.niveauAideTestSommetB : resultat.niveauAideTestSommetC;
          return (
            <LigneEcran key={sommet} label={`Test au sommet ${libelleSommetLettre(exercice, sommet)}`} revele={revele} niveauAide={niveauAide} />
          );
        })}
      {resultat.scoreConclusionTriangle !== null && (
        <LigneEcran label="Conclusion" revele={resultat.conclusionTriangleRevele} niveauAide={resultat.niveauAideConclusionTriangle} />
      )}
      {resultat.scoreConstructionAvecX !== null && (
        <LigneEcran label="Construction symbolique" revele={resultat.constructionAvecXRevele} niveauAide={resultat.niveauAideConstructionAvecX} />
      )}
      {exercice.variante === "triangleParametre" &&
        SOMMETS.map((sommet) => {
          const score = sommet === "A" ? resultat.scoreReductionSommetA : sommet === "B" ? resultat.scoreReductionSommetB : resultat.scoreReductionSommetC;
          if (score === null) return null;
          const revele =
            sommet === "A" ? resultat.reductionSommetARevele : sommet === "B" ? resultat.reductionSommetBRevele : resultat.reductionSommetCRevele;
          const niveauAide =
            sommet === "A"
              ? resultat.niveauAideReductionSommetA
              : sommet === "B"
                ? resultat.niveauAideReductionSommetB
                : resultat.niveauAideReductionSommetC;
          return (
            <LigneEcran key={sommet} label={`Réduction — sommet ${libelleSommetLettre(exercice, sommet)}`} revele={revele} niveauAide={niveauAide} />
          );
        })}
      {resultat.scoreIdentificationResolution !== null && (
        <LigneEcran
          label="Identification et résolution"
          revele={resultat.identificationResolutionRevele}
          niveauAide={resultat.niveauAideIdentificationResolution}
        />
      )}
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreTest === 0 && exercice.variante === "test" && (
        <div className="answer-reveal">
          Critère attendu : {critereReelTest(exercice)} — Conclusion attendue :{" "}
          {conclusionAttendueTest(exercice) ? LIBELLES_OUI_NON.positif : LIBELLES_OUI_NON.negatif}
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreReductionParametre === 0 && exercice.variante === "parametre" && (
        <div className="answer-reveal">
          Équation attendue : <Katex expression={formatEquationReduiteParametreLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreResolutionParametre === 0 && exercice.variante === "parametre" && (
        <div className="answer-reveal">
          x attendu : <Katex expression={`x = ${exercice.solutionX}`} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreConstructionTriangle === 0 && exercice.variante === "triangle" && (
        <div className="answer-reveal">
          <Katex
            expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurAC)} \\\\ \\vec{${exercice.labelB}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurBC)} \\end{gathered}`}
          />
        </div>
      )}
      {exercice.variante === "triangle" &&
        SOMMETS.map((sommet) => {
          const score = sommet === "A" ? resultat.scoreTestSommetA : sommet === "B" ? resultat.scoreTestSommetB : resultat.scoreTestSommetC;
          if (!afficherReponseApresEchec || score !== 0) return null;
          const critere = sommet === "A" ? exercice.critereA : sommet === "B" ? exercice.critereB : exercice.critereC;
          return (
            <div className="answer-reveal" key={sommet}>
              Critère attendu (sommet {libelleSommetLettre(exercice, sommet)}) : {critere}
            </div>
          );
        })}
      {afficherReponseApresEchec && resultat.scoreConclusionTriangle === 0 && exercice.variante === "triangle" && (
        <div className="answer-reveal">Conclusion attendue : {revelationConclusionSommetOuAucun(exercice, conclusionAttendueTriangle(exercice))}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreConstructionAvecX === 0 && exercice.variante === "triangleParametre" && (
        <div className="answer-reveal">
          <Katex
            expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAC)} \\\\ \\vec{${exercice.labelB}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurBC)} \\end{gathered}`}
          />
        </div>
      )}
      {exercice.variante === "triangleParametre" &&
        SOMMETS.map((sommet) => {
          const score = sommet === "A" ? resultat.scoreReductionSommetA : sommet === "B" ? resultat.scoreReductionSommetB : resultat.scoreReductionSommetC;
          if (!afficherReponseApresEchec || score !== 0) return null;
          const reduction = sommet === "A" ? exercice.reductionA : sommet === "B" ? exercice.reductionB : exercice.reductionC;
          return (
            <div className="answer-reveal" key={sommet}>
              Réduction attendue (sommet {libelleSommetLettre(exercice, sommet)}) : <Katex expression={formatReductionLatex(reduction)} />
            </div>
          );
        })}
      {afficherReponseApresEchec && resultat.scoreIdentificationResolution === 0 && exercice.variante === "triangleParametre" && (
        <div className="answer-reveal">
          Sommet attendu : {libelleRectangleEn(conclusionAttendueTriangleParametre(exercice), exercice)} — x attendu :{" "}
          <Katex expression={`x = ${exercice.solutionX}`} />
        </div>
      )}

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
