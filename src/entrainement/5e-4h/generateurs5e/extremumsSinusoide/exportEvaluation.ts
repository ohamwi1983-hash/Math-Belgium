import type { ExerciceExtremumsSinusoide, FonctionExtremum } from "../../core5e/extremumsSinusoide.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { CONSIGNE_GENERALE_EXTREMUMS, TEXTE_CONSIGNE_SOLUTIONS, formatEquationSubstitueeLatex, formatFonctionSourceLatex } from "../../ui5e/formatExtremumsSinusoide";
import { construireAvecFonction, genererExerciceExtremumsSinusoide } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceExtremumsSinusoide>` pour 5gen11 (Extremums d'une
 * fonction sinusoïdale) — feuille d'évaluation. `formatEquationSubstitueeLatex` (déjà utilisée par
 * le bloc "état actuel"/récapitulatif de l'écran interactif) donne directement l'équation
 * d'extremum substituée — le corrigé n'a besoin que d'elle plus la liste déjà calculée
 * `exercice.solutions`, jamais d'un nouveau calcul.
 */

function construireEnonceExtremumsSinusoide(exercice: ExerciceExtremumsSinusoide): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(`f(x) = ${formatFonctionSourceLatex(exercice)}`)],
    questions: [
      { consigne: [texte(CONSIGNE_GENERALE_EXTREMUMS)], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(TEXTE_CONSIGNE_SOLUTIONS)], reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrectionExtremumsSinusoide(exercice: ExerciceExtremumsSinusoide): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [latex(formatEquationSubstitueeLatex(exercice)), texte(".")] },
    { type: "paragraphe", fragments: [texte(`Solutions dans [0;2π[ : ${exercice.solutions.map((s) => s.toFixed(2)).join(", ")}.`)] },
  ];
}

export const adaptateurEvaluationExtremumsSinusoide: AdaptateurFeuilleExercices<ExerciceExtremumsSinusoide> = {
  titreDocument: "Extremums d'une fonction sinusoïdale — Évaluation",
  nomFichierBase: "extremums-sinusoide",
  genererInstance: genererExerciceExtremumsSinusoide,
  catalogueVariantes: [
    { id: "sin", label: "sin" },
    { id: "cos", label: "cos" },
  ],
  genererInstanceAvecVariante: (id) => construireAvecFonction(id as FonctionExtremum),
  construireEnonce: construireEnonceExtremumsSinusoide,
  construireCorrection: construireCorrectionExtremumsSinusoide,
};
