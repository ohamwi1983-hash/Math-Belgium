/**
 * Couche A — "Intégrales et primitives" (quiz vrai/faux), 6gen67, ajout ultérieur au chapitre 4.
 * Tire une question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de
 * génération procédurale, voir `core6e/quizIntegralesPrimitives.types.ts`. Structure identique à
 * 6gen66 (`quizFonctionsLogarithmes`) et 6gen65.
 */
import type {
  ExerciceQuizIntegralesPrimitives,
  GenerateurExerciceQuizIntegralesPrimitives,
  QuestionVraiFaux,
  VarianteQuizIntegralesPrimitives,
} from "../../core6e/quizIntegralesPrimitives.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_INTEGRALES_PRIMITIVES } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizIntegralesPrimitives; label: string }[] = [
  { id: "calculPrimitives", label: "Calcul de primitives" },
  { id: "quellePrimitive", label: "Quelle primitive ? (condition initiale)" },
  { id: "integralesDefinies", label: "Intégrales définies, paramètre et valeur moyenne" },
  { id: "calculAires", label: "Calcul d'aires par intégrale" },
  { id: "volumesRevolution", label: "Volumes de révolution" },
  { id: "longueurArc", label: "Longueur d'un arc de courbe" },
  { id: "integralesProblemes", label: "Intégrales et primitives : problèmes" },
];

function tirerQuestion(varianteId: VarianteQuizIntegralesPrimitives): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_INTEGRALES_PRIMITIVES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizIntegralesPrimitives,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizIntegralesPrimitives {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizIntegralesPrimitives(): ExerciceQuizIntegralesPrimitives {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}

function melanger<T>(items: readonly T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Générateur SANS RÉPÉTITION pour un thème donné — chaque session étudiant porte sur un thème
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (35) : sans
 * cette précaution, le tirage indépendant habituel
 * (`genererExerciceQuizIntegralesPrimitives`) pourrait répéter une question avant d'avoir couvert
 * les 34 autres. État interne (file mélangée, ré-mélangée à chaque épuisement) enfermé dans la
 * fermeture, jamais partagé entre deux appels de cette fonction — voir `App6gen67.tsx`, qui en crée
 * une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizIntegralesPrimitives,
): GenerateurExerciceQuizIntegralesPrimitives {
  const banque = BANQUE_QUIZ_INTEGRALES_PRIMITIVES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
