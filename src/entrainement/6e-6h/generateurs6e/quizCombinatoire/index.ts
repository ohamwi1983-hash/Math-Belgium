/**
 * Couche A — "Analyse combinatoire" (quiz vrai/faux), 6gen70, ajout ultérieur au chapitre 9. Tire
 * une question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de
 * génération procédurale, voir `core6e/quizCombinatoire.types.ts`. Structure identique à 6gen69
 * (`quizProbabilites`) et 6gen68/67/66/65.
 */
import type {
  ExerciceQuizCombinatoire,
  GenerateurExerciceQuizCombinatoire,
  QuestionVraiFaux,
  VarianteQuizCombinatoire,
} from "../../core6e/quizCombinatoire.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_COMBINATOIRE } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizCombinatoire; label: string }[] = [
  { id: "denombrementFondamental", label: "Dénombrement fondamental et arrangements" },
  { id: "denombrementCombine", label: "Dénombrement combiné et sélections" },
  { id: "binomeNewton", label: "Binôme de Newton" },
  { id: "denombrementProblemes", label: "Dénombrement : problèmes" },
  { id: "probabiliteHypergeometrique", label: "Probabilité hypergéométrique" },
  { id: "binomialeSequence", label: "Probabilité binomiale et séquence" },
];

function tirerQuestion(varianteId: VarianteQuizCombinatoire): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_COMBINATOIRE[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizCombinatoire,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizCombinatoire {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizCombinatoire(): ExerciceQuizCombinatoire {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizCombinatoire`) pourrait
 * répéter une question avant d'avoir couvert les 34 autres. État interne (file mélangée, ré-
 * mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `App6gen70.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizCombinatoire,
): GenerateurExerciceQuizCombinatoire {
  const banque = BANQUE_QUIZ_COMBINATOIRE[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
