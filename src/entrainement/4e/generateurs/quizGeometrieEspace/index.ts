/**
 * Couche A — "Géométrie dans l'espace" (quiz vrai/faux), soixante-sixième générateur. Tire une
 * question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération
 * procédurale, voir `core/quizGeometrieEspace.types.ts`. Structure identique à
 * `generateurs/quizGeometrieAnalytique/` (gen65) et aux 6 quiz précédents.
 */
import type { ExerciceQuizGeometrieEspace, GenerateurExerciceQuizGeometrieEspace, QuestionVraiFaux, VarianteQuizGeometrieEspace } from "../../core/quizGeometrieEspace.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_GEOMETRIE_ESPACE } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizGeometrieEspace; label: string }[] = [
  { id: "positionDroitePlan", label: "Position d'une droite par rapport à un plan" },
  { id: "sectionPlaneSolide", label: "Section plane d'un solide" },
  { id: "ombreSoleil", label: "Ombre au soleil — projection parallèle" },
];

function tirerQuestion(varianteId: VarianteQuizGeometrieEspace): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_GEOMETRIE_ESPACE[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizGeometrieEspace,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizGeometrieEspace {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizGeometrieEspace(): ExerciceQuizGeometrieEspace {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizGeometrieEspace`) pourrait
 * répéter une question avant d'avoir couvert les 34 autres. État interne (file mélangée, ré-mélangée
 * à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de cette
 * fonction — voir `AppQuizGeometrieEspace.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizGeometrieEspace): GenerateurExerciceQuizGeometrieEspace {
  const banque = BANQUE_QUIZ_GEOMETRIE_ESPACE[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
