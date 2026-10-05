/**
 * Couche A — "Calcul vectoriel" (quiz vrai/faux), soixante-quatrième générateur. Tire une question
 * dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération
 * procédurale, voir `core/quizCalculVectoriel.types.ts`. Structure identique à
 * `generateurs/quizCercleTriangles/` (gen63) et aux 4 quiz précédents.
 */
import type { ExerciceQuizCalculVectoriel, GenerateurExerciceQuizCalculVectoriel, QuestionVraiFaux, VarianteQuizCalculVectoriel } from "../../core/quizCalculVectoriel.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_CALCUL_VECTORIEL } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizCalculVectoriel; label: string }[] = [
  { id: "relationVectorielle", label: "Point à partir d'une relation vectorielle — translation, milieu, relation générale" },
  { id: "combinaisonLineaire", label: "Calcul de composantes d'une combinaison linéaire de vecteurs" },
  { id: "constructionGraphique", label: "Construction graphique de vecteurs — multiplier un vecteur par un scalaire" },
  { id: "colinearite", label: "Colinéarité de vecteurs et alignement de points" },
  { id: "orthogonalite", label: "Orthogonalité de vecteurs et théorème de Pythagore généralisé" },
  { id: "normeDistance", label: "Norme d'un vecteur et distance entre deux points" },
  { id: "chasles", label: "Réduction d'une somme de vecteurs — relation de Chasles" },
  { id: "comparaisonVisuelle", label: "Comparaison de vecteurs — longueur, direction et sens" },
  { id: "applicationsPhysiques", label: "Applications physiques — résultante de deux vecteurs" },
];

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
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (20) : sans
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizCalculVectoriel`) pourrait
 * répéter une question avant d'avoir couvert les 19 autres. État interne (file mélangée, ré-mélangée
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
