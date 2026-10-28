/**
 * Couche A — "Caractéristiques d'une fonction & fonctions de référence" (quiz vrai/faux),
 * soixante-deuxième générateur, ajout ultérieur au chapitre 3 (nommage propre à sa spec). Tire une
 * question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération
 * procédurale, voir `core/quizFonctionsReference.types.ts`. Structure identique à
 * `generateurs/quizEquationsSecondDegre/` (gen61) et aux 2 quiz précédents (gen59/gen60).
 */
import type { ExerciceQuizFonctionsReference, GenerateurExerciceQuizFonctionsReference, QuestionVraiFaux, VarianteQuizFonctionsReference } from "../../core/quizFonctionsReference.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_FONCTIONS_REFERENCE } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizFonctionsReference; label: string }[] = [
  { id: "vocabulaire", label: "Vocabulaire et lecture graphique" },
  { id: "sixFonctions", label: "Les 6 fonctions de référence — domaine et allure" },
  { id: "carreCube", label: "Fonction carrée et fonction cube" },
  { id: "racines", label: "Fonction racine carrée et fonction racine cubique" },
  { id: "inverse", label: "Fonction inverse — asymptotes et comportement" },
  { id: "valeurAbsolue", label: "Fonction valeur absolue" },
  { id: "transformations", label: "Transformations et forme canonique" },
];

function tirerQuestion(varianteId: VarianteQuizFonctionsReference): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_FONCTIONS_REFERENCE[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizFonctionsReference,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizFonctionsReference {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizFonctionsReference(): ExerciceQuizFonctionsReference {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}

/** Taille réelle de la banque d'un thème — 33 à 35 selon le thème depuis le retrait de 2
 * affirmations demandant de vérifier une liste EXACTE et complète de solutions (audit du chapitre
 * 3), jamais une constante 35 fixe. `AppQuizFonctionsReference.tsx` l'utilise pour fixer
 * `nombreExercices`, seule façon pour `creerGenerateurSansRepetition` ci-dessous de garder sa
 * garantie "jamais de répétition dans une session" quel que soit le thème choisi. */
export function nombreQuestions(varianteId: VarianteQuizFonctionsReference): number {
  return BANQUE_QUIZ_FONCTIONS_REFERENCE[varianteId].length;
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
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (33 à 35 selon
 * le thème, voir `nombreQuestions` ci-dessus) : sans cette précaution, le tirage indépendant
 * habituel (`genererExerciceQuizFonctionsReference`) pourrait répéter une question avant d'avoir
 * couvert toutes les autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `AppQuizFonctionsReference.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizFonctionsReference): GenerateurExerciceQuizFonctionsReference {
  const banque = BANQUE_QUIZ_FONCTIONS_REFERENCE[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
