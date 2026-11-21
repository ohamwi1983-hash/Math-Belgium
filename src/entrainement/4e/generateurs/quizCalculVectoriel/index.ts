/**
 * Couche A — "Calcul vectoriel" (quiz vrai/faux), soixante-quatrième générateur. Tire une question
 * dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération
 * procédurale, voir `core/quizCalculVectoriel.types.ts`. Structure identique à
 * `generateurs/quizCercleTriangles/` (gen63) et aux 4 quiz précédents.
 */
import type { ExerciceQuizCalculVectoriel, GenerateurExerciceQuizCalculVectoriel, QuestionVraiFaux, VarianteQuizCalculVectoriel } from "../../core/quizCalculVectoriel.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_CALCUL_VECTORIEL } from "./banque";

/** Thèmes dans l'ordre des sections du cours. */
export const CATALOGUE_VARIANTES: { id: VarianteQuizCalculVectoriel; label: string }[] = [
  { id: "constructionGraphique", label: "Multiplier un vecteur par un réel — construction graphique" },
  { id: "chasles", label: "Réduire une somme de vecteurs — relation de Chasles" },
  { id: "decomposerDemontrer", label: "Décomposer un vecteur et démontrer sans repère" },
  { id: "combinaisonLineaire", label: "Composantes d'une combinaison de vecteurs" },
  { id: "normeDistance", label: "Norme d'un vecteur et distance entre deux points" },
  { id: "relationVectorielle", label: "Points et vecteurs — translation, milieu, relation générale" },
  { id: "colinearite", label: "Colinéarité de vecteurs et alignement de points" },
  { id: "orthogonalite", label: "Orthogonalité de vecteurs et Pythagore généralisé" },
  { id: "quadrilateresConstructions", label: "Quadrilatères et constructions" },
  { id: "comparaisonVisuelle", label: "Comparer des vecteurs — longueur, direction et sens" },
  { id: "applicationsPhysiques", label: "Résultante de deux vecteurs" },
  { id: "vecteursContexte", label: "Vecteurs en contexte — déplacements, rivière, équilibre, chantier" },
];

/** Taille réelle de la banque d'un thème (35 aujourd'hui pour chacun des 12 thèmes) — jamais une
 * constante fixe : `AppQuizCalculVectoriel.tsx` l'utilise pour fixer `nombreExercices`, seule façon
 * pour `creerGenerateurSansRepetition` de garder sa garantie « jamais de répétition dans une
 * session » si un thème venait à perdre ou gagner des affirmations (`.claude/rules/quiz-generators.md`). */
export function nombreQuestions(varianteId: VarianteQuizCalculVectoriel): number {
  return BANQUE_QUIZ_CALCUL_VECTORIEL[varianteId].length;
}

/** Bornes min/max des tailles de thèmes, pour un texte d'accueil toujours exact. */
export function etendueNombreQuestions(): { min: number; max: number } {
  const tailles = CATALOGUE_VARIANTES.map((v) => nombreQuestions(v.id));
  return { min: Math.min(...tailles), max: Math.max(...tailles) };
}

function tirerQuestion(varianteId: VarianteQuizCalculVectoriel): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_CALCUL_VECTORIEL[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizCalculVectoriel,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizCalculVectoriel {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizCalculVectoriel(): ExerciceQuizCalculVectoriel {
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
 * unique et compte autant d'exercices que de questions dans la banque de ce thème
 * (`nombreQuestions`) : sans cette précaution, le tirage indépendant habituel
 * (`genererExerciceQuizCalculVectoriel`) pourrait répéter une question avant d'avoir couvert les
 * autres. État interne (file mélangée, ré-mélangée
 * à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de cette fonction
 * — voir `AppQuizCalculVectoriel.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizCalculVectoriel): GenerateurExerciceQuizCalculVectoriel {
  const banque = BANQUE_QUIZ_CALCUL_VECTORIEL[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
