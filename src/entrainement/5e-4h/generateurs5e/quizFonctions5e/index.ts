/**
 * Couche A (5e) — "Fonctions : rappels et compléments" (quiz vrai/faux), 5gen39, chapitre 1. Tire
 * une question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de
 * génération procédurale, voir `core5e/quizFonctions5e.types.ts`. Structure mécaniquement identique
 * au quiz vrai/faux 4e (`generateurs/quizFonctionsReference/index.ts`, gen59-62).
 */
import type { ExerciceQuizFonctions5e, GenerateurExerciceQuizFonctions5e, QuestionVraiFaux5e, VarianteQuizFonctions5e } from "../../core5e/quizFonctions5e.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_FONCTIONS_5E } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizFonctions5e; label: string }[] = [
  { id: "vocabulaire", label: "Vocabulaire et généralités" },
  { id: "domaineRationnel", label: "Domaine de définition — fractions rationnelles" },
  { id: "domaineRacines", label: "Domaine de définition — racines" },
  { id: "decomposition", label: "Décomposer une fonction composée" },
  { id: "composition", label: "Composer f et g — expressions et domaines" },
  { id: "lectureGraphique", label: "Lecture graphique de fonctions composées" },
  { id: "problemesContexte", label: "Problèmes en contexte" },
];

function tirerQuestion(varianteId: VarianteQuizFonctions5e): QuestionVraiFaux5e {
  const banque = BANQUE_QUIZ_FONCTIONS_5E[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizFonctions5e,
  overrides?: { question?: QuestionVraiFaux5e },
): ExerciceQuizFonctions5e {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizFonctions5e(): ExerciceQuizFonctions5e {
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
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (20) : sans
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizFonctions5e`) pourrait
 * répéter une question avant d'avoir couvert les 19 autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `App5gen39.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizFonctions5e): GenerateurExerciceQuizFonctions5e {
  const banque = BANQUE_QUIZ_FONCTIONS_5E[varianteId];
  let file: QuestionVraiFaux5e[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux5e;
    return { variante: varianteId, question };
  };
}
