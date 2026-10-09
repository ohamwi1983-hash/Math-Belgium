import type { ExerciceGraphiqueDeriveeLogarithme } from "../../core6e/graphiqueDeriveeLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction } from "../../../export/svgGraph";
import { calculerViewBoxGraphique, evaluerCandidat, formatDeriveeCorrecteLatex, formatFonctionLatex, type ViewBoxGraphiqueDeriveeLogarithme } from "../../ui6e/formatGraphiqueDeriveeLogarithme";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiqueDeriveeLogarithme } from "./index";

const LETTRES = "ABCD";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGraphiqueDeriveeLogarithme>` pour `6gen20`
 * (Graphique de la dérivée, fonctions logarithmes) — feuille d'évaluation, voir
 * `generateurs6e/graphiquesDeriveeExponentielles/exportEvaluation.ts` (6gen8) pour le patron
 * exact réutilisé ici : QCM graphique réel (4 candidats tracés en `<svg>` statique via le moteur
 * générique `export/svgGraph.ts::construireSvgFonction`, jamais réduit à des questions
 * textuelles), grille lettrée A→D construite localement (comme
 * `generateurs/transformationsGraphiques/exportEvaluation.ts`, jamais de fichier séparé).
 *
 * Contrairement à `6gen8` (1 ou 2 écrans SELON la famille), `6gen20` traverse TOUJOURS les 2
 * écrans ("derivee" puis "selection", voir l'en-tête de `core6e/graphiqueDeriveeLogarithme.types.ts`)
 * — les 2 questions écrites (calcul symbolique de f'(x), puis sélection du bon graphique) sont
 * donc systématiques, jamais conditionnées à la famille. `formatDeriveeCorrecteLatex` (déjà
 * exposé par `ui6e/formatGraphiqueDeriveeLogarithme.ts`, reconstruit depuis les paramètres bruts
 * de l'exercice — jamais recalculé indépendamment ici) fournit directement la correction de la
 * question a).
 */

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
    enteteFragments: [texte("On considère la fonction "), latex(formatFonctionLatex(exercice))],
    enteteHtml: construireGrilleSvgCandidats(exercice, viewBox),
    questions: [
      { consigne: [texte("Calcule f'(x).")], reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte("Sélectionne le graphique qui représente f'(x).")], reponse: { type: "lignes", nombre: 1 } },
    ],
  };
}

function construireCorrectionGraphiqueDeriveeLogarithme(exercice: ExerciceGraphiqueDeriveeLogarithme): BlocCorrection[] {
  const viewBox = calculerViewBoxGraphique(exercice);
  const lettreCorrecte = LETTRES[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
  return [
    { type: "paragraphe", fragments: [texte("a) "), latex(formatDeriveeCorrecteLatex(exercice))] },
    { type: "paragraphe", fragments: [texte(`b) Réponse : le graphique ${lettreCorrecte}.`)] },
    { type: "html", html: construireGrilleSvgCandidats(exercice, viewBox, exercice.indexCorrect) },
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
