/**
 * Couche A — "Lieux géométriques" (quiz vrai/faux), 6gen72, ajout ultérieur au chapitre "Lieux
 * géométriques". Tire une question dans la banque pré-écrite (`banque.ts`) du thème (variante)
 * actif — jamais de génération procédurale, voir `core6e/quizLieuxGeometriques.types.ts`.
 * Structure identique à 6gen71 (`quizVariablesAleatoires`) et 6gen70/69/68/67/66/65.
 */
import type {
  ExerciceQuizLieuxGeometriques,
  GenerateurExerciceQuizLieuxGeometriques,
  QuestionVraiFaux,
  VarianteQuizLieuxGeometriques,
} from "../../core6e/quizLieuxGeometriques.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_LIEUX_GEOMETRIQUES } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizLieuxGeometriques; label: string }[] = [
  { id: "pointsDroitesRemarquablesTriangle", label: "Points et droites remarquables du triangle" },
  { id: "cercles", label: "Cercles" },
  { id: "lieuxGeometriquesParametres", label: "Lieux géométriques et élimination de paramètre" },
  { id: "methodeGeneratrices", label: "Problèmes de lieux : méthode des génératrices" },
];

function tirerQuestion(varianteId: VarianteQuizLieuxGeometriques): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_LIEUX_GEOMETRIQUES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizLieuxGeometriques,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizLieuxGeometriques {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizLieuxGeometriques(): ExerciceQuizLieuxGeometriques {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizLieuxGeometriques`)
 * pourrait répéter une question avant d'avoir couvert les 34 autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `App6gen72.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizLieuxGeometriques,
): GenerateurExerciceQuizLieuxGeometriques {
  const banque = BANQUE_QUIZ_LIEUX_GEOMETRIQUES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
