import type { ExerciceGraphiqueDeriveeLogarithme } from "../../core6e/graphiqueDeriveeLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction } from "../../../export/svgGraph";
import {
  calculerViewBoxFonction,
  calculerViewBoxGraphique,
  evaluerCandidat,
  evaluerFonction,
  formatDeriveeCorrecteLatex,
  formatFonctionLatex,
  type ViewBoxGraphiqueDeriveeLogarithme,
} from "../../ui6e/formatGraphiqueDeriveeLogarithme";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiqueDeriveeLogarithme } from "./index";

const LETTRES = "ABCD";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGraphiqueDeriveeLogarithme>` pour `6gen20`
 * (Graphique de la dérivée, fonctions logarithmes) — feuille d'évaluation, même patron que
 * `generateurs6e/graphiquesDeriveeExponentielles/exportEvaluation.ts` (6gen8) : QCM graphique réel
 * (`export/svgGraph.ts::construireSvgFonction`), grille lettrée A→D construite localement.
 *
 * Même ordre que l'appli : a) choisir le graphique de f' à partir du GRAPHIQUE de f (imprimé en
 * tête, couleur distincte), b) calculer f'(x) pour confirmer.
 */

const COULEUR_FONCTION = "#c2410c";

function construireSvgFonctionF(exercice: ExerciceGraphiqueDeriveeLogarithme): string {
  return `<div class="grille-graphes-cyclo">${construireSvgFonction((x) => evaluerFonction(exercice, x), calculerViewBoxFonction(exercice), { lettre: "f", couleurCourbe: COULEUR_FONCTION })}</div>`;
}

function construireGrilleSvgCandidats(exercice: ExerciceGraphiqueDeriveeLogarithme, viewBox: ViewBoxGraphiqueDeriveeLogarithme, indexCorrectAAfficher?: number): string {
  const svgs = exercice.candidats
    .map((_, i) =>
      construireSvgFonction((x) => evaluerCandidat(exercice, i, x), viewBox, {
        lettre: LETTRES[i] ?? String(i + 1),
        estCorrect: indexCorrectAAfficher === i,
      }),
    )
    .join("");
  return `<div class="grille-graphes-cyclo">${svgs}</div>`;
}

function construireEnonceGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): SectionExercice {
  const viewBox = calculerViewBoxGraphique(exercice);
  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFonctionLatex(exercice)), texte(", dont le graphique est donné (f), et quatre graphiques A à D.")],
    enteteHtml: construireSvgFonctionF(exercice) + construireGrilleSvgCandidats(exercice, viewBox),
    questions: [
      { consigne: [texte("En lisant le graphique de f (variations, extremums, pentes), indique lequel des graphiques A à D représente f'(x). Justifie.")], reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte("Calcule f'(x) et vérifie qu'elle confirme ton choix.")], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): BlocCorrection[] {
  const viewBox = calculerViewBoxGraphique(exercice);
  const lettreCorrecte = LETTRES[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
  return [
    { type: "paragraphe", fragments: [texte(`a) Réponse : le graphique ${lettreCorrecte}.`)] },
    { type: "html", html: construireGrilleSvgCandidats(exercice, viewBox, exercice.indexCorrect) },
    { type: "paragraphe", fragments: [texte("b) "), latex(formatDeriveeCorrecteLatex(exercice))] },
  ];
}

export const adaptateurEvaluationGraphiqueDeriveeLogarithme: AdaptateurFeuilleExercices<ExerciceGraphiqueDeriveeLogarithme> = {
  titreDocument: "Graphique de la dérivée (fonctions logarithmes) — Évaluation",
  nomFichierBase: "graphique-derivee-logarithme",
  genererInstance: genererExerciceGraphiqueDeriveeLogarithme,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceGraphiqueDeriveeLogarithme,
  construireCorrection: construireCorrectionGraphiqueDeriveeLogarithme,
};
