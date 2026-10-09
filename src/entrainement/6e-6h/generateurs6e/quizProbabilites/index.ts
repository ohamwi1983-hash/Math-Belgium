/**
 * Couche A — "Probabilités" (quiz vrai/faux), 6gen69, ajout ultérieur au chapitre 8. Tire une
 * question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération
 * procédurale, voir `core6e/quizProbabilites.types.ts`. Structure identique à 6gen68
 * (`quizNombresComplexes`) et 6gen67/66/65/64.
 */
import type {
  ExerciceQuizProbabilites,
  GenerateurExerciceQuizProbabilites,
  QuestionVraiFaux,
  VarianteQuizProbabilites,
} from "../../core6e/quizProbabilites.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_PROBABILITES } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizProbabilites; label: string }[] = [
  { id: "probabilitesEnsembles", label: "Probabilités et ensembles" },
  { id: "tiragesArbres", label: "Tirages, arbres et dénombrement" },
  { id: "independanceBayes", label: "Indépendance, conditionnement et Bayes" },
  { id: "probabilitesProblemes", label: "Probabilités : problèmes" },
];

function tirerQuestion(varianteId: VarianteQuizProbabilites): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_PROBABILITES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizProbabilites,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizProbabilites {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizProbabilites(): ExerciceQuizProbabilites {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizProbabilites`) pourrait
 * répéter une question avant d'avoir couvert les 34 autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `App6gen69.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizProbabilites,
): GenerateurExerciceQuizProbabilites {
  const banque = BANQUE_QUIZ_PROBABILITES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
