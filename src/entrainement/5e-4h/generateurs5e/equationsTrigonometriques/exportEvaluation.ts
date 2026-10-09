import type { ExerciceEquationTrig } from "../../core5e/equationsTrigonometriques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { ANNONCE_PRECISION_DECIMAL, CONSIGNE_GENERALE_EQUATION_TRIG, formatBranchesLatex, formatEquationEnonceLatex } from "../../ui5e/formatEquationTrig";
import { TEXTE_ARGUMENT_AUCUNE_SOLUTION, formatSolutionsTexte } from "../../ui5e/formatEquationTrigonometrique";
import { genererExerciceEquationTrig } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationTrig>` pour 5gen10 (Équations
 * trigonométriques trig(ax+b)=k) — feuille d'évaluation. `5gen10` couvre en réalité 4 familles de
 * techniques (directe/produit/pythagoricienne/égalité, voir `core5e/equationsTrigonometriques.types.ts`) ;
 * la version papier n'en couvre volontairement qu'UNE — la famille "directe" (`ExerciceEquationTrig`),
 * celle qui porte le nom même de la section ("trig(ax+b)=k") — même principe de simplification que
 * pour 5gen5/5gen13.
 */

function construireEnonceEquationTrig(exercice: ExerciceEquationTrig): SectionExercice {
  const precision = exercice.regime === "decimal" ? ANNONCE_PRECISION_DECIMAL : "";
  return {
    enteteFragments: [latex(formatEquationEnonceLatex(exercice))],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE_EQUATION_TRIG + precision)], reponse: { type: "lignes", nombre: 4 } }],
  };
}

function construireCorrectionEquationTrig(exercice: ExerciceEquationTrig): BlocCorrection[] {
  if (exercice.aucuneSolution) {
    return [{ type: "paragraphe", fragments: [texte(TEXTE_ARGUMENT_AUCUNE_SOLUTION)] }];
  }
  const branchesU = formatBranchesLatex(exercice.branchesU);
  const branchesX = formatBranchesLatex(exercice.branchesX);
  return [
    { type: "paragraphe", fragments: [texte("Argument : "), ...branchesU.flatMap((b, i) => [latex(`u = ${b}`), texte(i < branchesU.length - 1 ? " ou " : "")])] },
    { type: "paragraphe", fragments: [texte("x : "), ...branchesX.flatMap((b, i) => [latex(`x = ${b}`), texte(i < branchesX.length - 1 ? " ou " : "")])] },
    { type: "paragraphe", fragments: [texte(`Solutions dans [0;2π[ : ${formatSolutionsTexte(exercice.solutions, exercice.regime)}.`)] },
  ];
}

export const adaptateurEvaluationEquationTrig: AdaptateurFeuilleExercices<ExerciceEquationTrig> = {
  titreDocument: "Équations trigonométriques — Évaluation",
  nomFichierBase: "equations-trigonometriques",
  genererInstance: genererExerciceEquationTrig,
  construireEnonce: construireEnonceEquationTrig,
  construireCorrection: construireCorrectionEquationTrig,
};
