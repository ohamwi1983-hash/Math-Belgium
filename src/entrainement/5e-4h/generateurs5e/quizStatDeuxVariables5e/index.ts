/**
 * Couche A (5e) — "Statistique à deux variables" (quiz vrai/faux), 5gen82, chapitre 6. Tire une question
 * dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération
 * procédurale, voir `core5e/quizStatDeuxVariables5e.types.ts`. Structure mécaniquement identique au quiz
 * vrai/faux du chapitre 5 (`generateurs5e/quizDerivees5e/index.ts`, 5gen43), du chapitre 4 (`generateurs5e/quizLimites5e/index.ts`, 5gen42), du chapitre 3
 * (`generateurs5e/quizSuites5e/index.ts`, 5gen41), du chapitre 2
 * (`generateurs5e/quizTrigonometrie5e/index.ts`, 5gen40), du chapitre 1
 * (`generateurs5e/quizFonctions5e/index.ts`, 5gen39) et au quiz vrai/faux 4e
 * (`generateurs/quizFonctionsReference/index.ts`, gen59-62).
 */
import type { ExerciceQuizStatDeuxVariables5e, GenerateurExerciceQuizStatDeuxVariables5e, QuestionVraiFaux5e, VarianteQuizStatDeuxVariables5e } from "../../core5e/quizStatDeuxVariables5e.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_STAT_DEUX_VARIABLES_5E } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizStatDeuxVariables5e; label: string }[] = [
  { id: "nuagePointMoyen", label: "Nuage de points et point moyen" },
  { id: "ajustement", label: "Ajuster un nuage : affine ou pas ?" },
  { id: "mayer", label: "Droite de Mayer" },
  { id: "moindresCarres", label: "Droite des moindres carrés" },
  { id: "correlation", label: "Covariance et coefficient de corrélation" },
  { id: "interpreter", label: "Interpréter : fiabilité et causalité" },
];

/** Taille RÉELLE de la banque d'un thème (`.claude/rules/quiz-generators.md`, piège du nombre fixe). */
export function nombreQuestions(varianteId: VarianteQuizStatDeuxVariables5e): number {
  return BANQUE_QUIZ_STAT_DEUX_VARIABLES_5E[varianteId].length;
}

/** Bornes min/max des tailles de thèmes, pour un texte d'accueil toujours exact. */
export function etendueNombreQuestions(): { min: number; max: number } {
  const tailles = CATALOGUE_VARIANTES.map((v) => nombreQuestions(v.id));
  return { min: Math.min(...tailles), max: Math.max(...tailles) };
}

function tirerQuestion(varianteId: VarianteQuizStatDeuxVariables5e): QuestionVraiFaux5e {
  const banque = BANQUE_QUIZ_STAT_DEUX_VARIABLES_5E[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizStatDeuxVariables5e,
  overrides?: { question?: QuestionVraiFaux5e },
): ExerciceQuizStatDeuxVariables5e {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizStatDeuxVariables5e(): ExerciceQuizStatDeuxVariables5e {
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
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (`nombreQuestions`) :
 * sans cette précaution, le tirage indépendant habituel (`genererExerciceQuizStatDeuxVariables5e`) pourrait
 * répéter une question avant d'avoir couvert toutes les autres. État interne (file mélangée, ré-mélangée
 * à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de cette fonction
 * — voir `App5gen82.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizStatDeuxVariables5e): GenerateurExerciceQuizStatDeuxVariables5e {
  const banque = BANQUE_QUIZ_STAT_DEUX_VARIABLES_5E[varianteId];
  let file: QuestionVraiFaux5e[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux5e;
    return { variante: varianteId, question };
  };
}
