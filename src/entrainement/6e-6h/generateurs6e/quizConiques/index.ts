/**
 * Couche A — "Les coniques" (quiz vrai/faux), 6gen73, ajout ultérieur au chapitre "Les coniques".
 * Tire une question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de
 * génération procédurale, voir `core6e/quizConiques.types.ts`. Structure identique à 6gen72
 * (`quizLieuxGeometriques`) et 6gen71/70/69/68/67/66/65.
 */
import type {
  ExerciceQuizConiques,
  GenerateurExerciceQuizConiques,
  QuestionVraiFaux,
  VarianteQuizConiques,
} from "../../core6e/quizConiques.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_CONIQUES } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizConiques; label: string }[] = [
  { id: "identificationConiques", label: "Identification d'une conique et de ses éléments caractéristiques" },
  { id: "equationDepuisCaracteristiques", label: "Équation d'une conique depuis ses caractéristiques" },
  { id: "aireExcentriciteConique", label: "Aire via rayons focaux et excentricité" },
  { id: "intersectionsConiques", label: "Intersections droite-conique et conique-conique" },
  { id: "tangentesConique", label: "Tangentes à une conique" },
  { id: "proprietesOptiquesConiques", label: "Propriétés optiques des coniques" },
];

function tirerQuestion(varianteId: VarianteQuizConiques): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_CONIQUES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizConiques,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizConiques {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizConiques(): ExerciceQuizConiques {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizConiques`) pourrait répéter
 * une question avant d'avoir couvert les 34 autres. État interne (file mélangée, ré-mélangée à
 * chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de cette fonction —
 * voir `App6gen73.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizConiques,
): GenerateurExerciceQuizConiques {
  const banque = BANQUE_QUIZ_CONIQUES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
