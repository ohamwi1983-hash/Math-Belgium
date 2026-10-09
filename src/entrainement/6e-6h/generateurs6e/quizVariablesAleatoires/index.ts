/**
 * Couche A — "Variables aléatoires et lois de probabilités" (quiz vrai/faux), 6gen71, ajout
 * ultérieur au chapitre 10. Tire une question dans la banque pré-écrite (`banque.ts`) du thème
 * (variante) actif — jamais de génération procédurale, voir `core6e/quizVariablesAleatoires.types.ts`.
 * Structure identique à 6gen70 (`quizCombinatoire`) et 6gen69/68/67/66/65.
 */
import type {
  ExerciceQuizVariablesAleatoires,
  GenerateurExerciceQuizVariablesAleatoires,
  QuestionVraiFaux,
  VarianteQuizVariablesAleatoires,
} from "../../core6e/quizVariablesAleatoires.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_VARIABLES_ALEATOIRES } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizVariablesAleatoires; label: string }[] = [
  { id: "variablesDiscretesEsperance", label: "Variables aléatoires discrètes et espérance" },
  { id: "loiBinomiale", label: "Loi binomiale" },
  { id: "loiNormale", label: "Loi normale" },
  { id: "extensionsBinomialeNormaleBayes", label: "Extensions binomiale, normale et Bayes" },
  { id: "loiPoisson", label: "Loi de Poisson" },
];

function tirerQuestion(varianteId: VarianteQuizVariablesAleatoires): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_VARIABLES_ALEATOIRES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizVariablesAleatoires,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizVariablesAleatoires {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizVariablesAleatoires(): ExerciceQuizVariablesAleatoires {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizVariablesAleatoires`)
 * pourrait répéter une question avant d'avoir couvert les 34 autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `App6gen71.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizVariablesAleatoires,
): GenerateurExerciceQuizVariablesAleatoires {
  const banque = BANQUE_QUIZ_VARIABLES_ALEATOIRES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
