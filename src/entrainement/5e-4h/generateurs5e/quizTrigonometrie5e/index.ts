/**
 * Couche A (5e) — "Trigonométrie" (quiz vrai/faux), 5gen40, chapitre 2. Tire une question dans la
 * banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération procédurale, voir
 * `core5e/quizTrigonometrie5e.types.ts`. Structure mécaniquement identique au quiz vrai/faux du
 * chapitre 1 (`generateurs5e/quizFonctions5e/index.ts`, 5gen39) et au quiz vrai/faux 4e
 * (`generateurs/quizFonctionsReference/index.ts`, gen59-62).
 */
import type { ExerciceQuizTrigonometrie5e, GenerateurExerciceQuizTrigonometrie5e, QuestionVraiFaux5e, VarianteQuizTrigonometrie5e } from "../../core5e/quizTrigonometrie5e.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_TRIGONOMETRIE_5E } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizTrigonometrie5e; label: string }[] = [
  { id: "arcsEtSecteurs", label: "Arcs, secteurs et conversion radian/degré" },
  { id: "parametresSinusoide", label: "Paramètres d'une fonction sinusoïdale" },
  { id: "graphesSinusoides", label: "Lecture graphique d'une sinusoïde" },
  { id: "equationsTrigonometriques", label: "Résoudre une équation trigonométrique" },
  { id: "identitesEtFactorisation", label: "Identités et équations trigonométriques avancées" },
  { id: "extremumsSinusoide", label: "Extremums d'une fonction sinusoïdale" },
  { id: "geometrieEtModelisation", label: "Géométrie du cercle et modélisation en contexte" },
];

function tirerQuestion(varianteId: VarianteQuizTrigonometrie5e): QuestionVraiFaux5e {
  const banque = BANQUE_QUIZ_TRIGONOMETRIE_5E[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizTrigonometrie5e,
  overrides?: { question?: QuestionVraiFaux5e },
): ExerciceQuizTrigonometrie5e {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizTrigonometrie5e(): ExerciceQuizTrigonometrie5e {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizTrigonometrie5e`) pourrait
 * répéter une question avant d'avoir couvert les 19 autres. État interne (file mélangée, ré-mélangée
 * à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de cette fonction
 * — voir `App5gen40.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizTrigonometrie5e): GenerateurExerciceQuizTrigonometrie5e {
  const banque = BANQUE_QUIZ_TRIGONOMETRIE_5E[varianteId];
  let file: QuestionVraiFaux5e[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux5e;
    return { variante: varianteId, question };
  };
}
