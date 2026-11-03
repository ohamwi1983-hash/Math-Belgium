/**
 * Couche A — "Fonctions logarithmes" (quiz vrai/faux), 6gen66, ajout ultérieur au chapitre 3. Tire
 * une question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de
 * génération procédurale, voir `core6e/quizFonctionsLogarithmes.types.ts`. Structure identique à
 * 6gen65 (`quizFonctionsExponentielles`) et 6gen64.
 */
import type {
  ExerciceQuizFonctionsLogarithmes,
  GenerateurExerciceQuizFonctionsLogarithmes,
  QuestionVraiFaux,
  VarianteQuizFonctionsLogarithmes,
} from "../../core6e/quizFonctionsLogarithmes.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_FONCTIONS_LOGARITHMES } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizFonctionsLogarithmes; label: string }[] = [
  { id: "proprietesLogarithme", label: "Propriétés du logarithme" },
  { id: "equationsExpLog", label: "Résoudre une équation exponentielle ou logarithmique" },
  { id: "inequationsLogarithme", label: "Résoudre une inéquation logarithmique" },
  { id: "domaineDeriveeLogarithme", label: "Domaine, dérivée et dérivation logarithmique" },
  { id: "limitesLogarithme", label: "Calculer des limites (fonctions logarithmes)" },
  { id: "parametresGraphiques", label: "Déterminer des paramètres depuis des conditions graphiques" },
  { id: "sinusCosinusHyperboliques", label: "Sinus et cosinus hyperboliques (sh, ch)" },
  { id: "graphiqueDeriveeLogarithme", label: "Graphique de la fonction dérivée (fonctions logarithmes)" },
  { id: "etudeFonctionLogarithme", label: "Étudier une fonction (synthèse, logarithmes)" },
  { id: "logarithmesProblemes", label: "Logarithmes : problèmes" },
];

/** Taille réelle de la banque d'un thème — jamais une constante en dur (convention
 * `.claude/rules/quiz-generators.md`) : une session parcourt exactement toutes les questions du
 * thème sans répétition. */
export function nombreQuestions(varianteId: VarianteQuizFonctionsLogarithmes): number {
  return BANQUE_QUIZ_FONCTIONS_LOGARITHMES[varianteId].length;
}

/** Bornes min/max des tailles de thèmes, pour un texte d'accueil toujours exact. */
export function etendueNombreQuestions(): { min: number; max: number } {
  const tailles = CATALOGUE_VARIANTES.map((v) => nombreQuestions(v.id));
  return { min: Math.min(...tailles), max: Math.max(...tailles) };
}

function tirerQuestion(varianteId: VarianteQuizFonctionsLogarithmes): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_FONCTIONS_LOGARITHMES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizFonctionsLogarithmes,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizFonctionsLogarithmes {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizFonctionsLogarithmes(): ExerciceQuizFonctionsLogarithmes {
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
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (`nombreQuestions`) : sans
 * cette précaution, le tirage indépendant habituel
 * (`genererExerciceQuizFonctionsLogarithmes`) pourrait répéter une question avant d'avoir couvert
 * toutes les autres. État interne (file mélangée, ré-mélangée à chaque épuisement) enfermé dans la
 * fermeture, jamais partagé entre deux appels de cette fonction — voir `App6gen66.tsx`, qui en crée
 * une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizFonctionsLogarithmes,
): GenerateurExerciceQuizFonctionsLogarithmes {
  const banque = BANQUE_QUIZ_FONCTIONS_LOGARITHMES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
