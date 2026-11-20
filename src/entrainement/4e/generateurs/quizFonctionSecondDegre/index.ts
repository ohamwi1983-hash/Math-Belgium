/**
 * Couche A — "La fonction du second degré" (quiz vrai/faux), soixantième générateur, ajout
 * ultérieur au chapitre 1. Tire une question dans la banque pré-écrite (`banque.ts`) du thème
 * (variante) actif — jamais de génération procédurale, voir `core/quizFonctionSecondDegre.types.ts`.
 * Structure identique à `generateurs/quizStatistiqueDescriptive/` (gen59).
 */
import type { ExerciceQuizFonctionSecondDegre, GenerateurExerciceQuizFonctionSecondDegre, QuestionVraiFaux, VarianteQuizFonctionSecondDegre } from "../../core/quizFonctionSecondDegre.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_FONCTION_SECOND_DEGRE } from "./banque";

/** Dans l'ordre des sections du cours (§ 1 : cinq thèmes, § 2 : quatre, § 3 : un). */
export const CATALOGUE_VARIANTES: { id: VarianteQuizFonctionSecondDegre; label: string }[] = [
  { id: "coefficientsAllure", label: "Coefficients et allure" },
  { id: "lectureGraphique", label: "Lire a, b et c sur un graphique" },
  { id: "differencesSecondes", label: "Tableau de valeurs et différences secondes" },
  { id: "racinesFactorisation", label: "Zéros par factorisation" },
  { id: "domaineImageTableaux", label: "Domaine, image et tableaux" },
  { id: "transformationsGraphiques", label: "Transformations graphiques (TH, TV, EV, CV, SOX)" },
  { id: "formeCanoniqueSommet", label: "Forme canonique, sommet et axe de symétrie" },
  { id: "completerCarre", label: "Compléter le carré" },
  { id: "troisEcritures", label: "Trois écritures et retrouver l'équation" },
  { id: "optimisation", label: "Problèmes d'optimisation" },
];

function tirerQuestion(varianteId: VarianteQuizFonctionSecondDegre): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_FONCTION_SECOND_DEGRE[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizFonctionSecondDegre,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizFonctionSecondDegre {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizFonctionSecondDegre(): ExerciceQuizFonctionSecondDegre {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}

/** Taille réelle de la banque d'un thème (35 partout depuis le lot E de l'audit du 4e ch. 1),
 * jamais une constante fixe : un thème peut changer de taille. `AppQuizFonctionSecondDegre.tsx` l'utilise pour fixer `nombreExercices`,
 * seule façon pour `creerGenerateurSansRepetition` ci-dessous de garder sa garantie "jamais de
 * répétition dans une session" quel que soit le thème choisi. */
export function nombreQuestions(varianteId: VarianteQuizFonctionSecondDegre): number {
  return BANQUE_QUIZ_FONCTION_SECOND_DEGRE[varianteId].length;
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
 * unique et compte autant d'exercices que de questions dans la banque de ce thème : sans
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizFonctionSecondDegre`)
 * pourrait répéter une question avant d'avoir couvert toutes les autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `AppQuizFonctionSecondDegre.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizFonctionSecondDegre): GenerateurExerciceQuizFonctionSecondDegre {
  const banque = BANQUE_QUIZ_FONCTION_SECOND_DEGRE[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
