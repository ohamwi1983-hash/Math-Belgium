/**
 * Couche A — "Nombres complexes" (quiz vrai/faux), 6gen68, ajout ultérieur au chapitre 7. Tire une
 * question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération
 * procédurale, voir `core6e/quizNombresComplexes.types.ts`. Structure identique à 6gen67
 * (`quizIntegralesPrimitives`) et 6gen66/65.
 */
import type {
  ExerciceQuizNombresComplexes,
  GenerateurExerciceQuizNombresComplexes,
  QuestionVraiFaux,
  VarianteQuizNombresComplexes,
} from "../../core6e/quizNombresComplexes.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_NOMBRES_COMPLEXES } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizNombresComplexes; label: string }[] = [
  { id: "operationsBase", label: "Opérations de base et puissances de i" },
  { id: "affixesRacines", label: "Affixes et racines carrées" },
  { id: "equationsComplexes", label: "Équations dans ℂ" },
  { id: "formeTrigonometrique", label: "Forme trigonométrique, module et argument" },
  { id: "formuleMoivre", label: "Formule de Moivre" },
  { id: "racinesNiemes", label: "Racines n-ièmes d'un nombre complexe" },
  { id: "transformationsPlan", label: "Transformations du plan" },
  { id: "trianglesComplexes", label: "Propriétés géométriques de triangles" },
  { id: "complexesAvances", label: "Problèmes avancés" },
];

function tirerQuestion(varianteId: VarianteQuizNombresComplexes): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_NOMBRES_COMPLEXES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizNombresComplexes,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizNombresComplexes {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizNombresComplexes(): ExerciceQuizNombresComplexes {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizNombresComplexes`) pourrait
 * répéter une question avant d'avoir couvert les 34 autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `App6gen68.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizNombresComplexes,
): GenerateurExerciceQuizNombresComplexes {
  const banque = BANQUE_QUIZ_NOMBRES_COMPLEXES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
