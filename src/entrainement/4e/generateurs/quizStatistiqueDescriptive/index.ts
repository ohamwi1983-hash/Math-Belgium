/**
 * Couche A — "Statistique descriptive à une variable" (quiz vrai/faux), cinquante-neuvième
 * générateur, dixième du chapitre 5. Tire une question dans la banque pré-écrite (`banque.ts`)
 * du thème (variante) actif — jamais de génération procédurale, voir `core/quizStatistiqueDescriptive.types.ts`.
 */
import type { ExerciceQuizStatistiqueDescriptive, GenerateurExerciceQuizStatistiqueDescriptive, QuestionVraiFaux, VarianteQuizStatistiqueDescriptive } from "../../core/quizStatistiqueDescriptive.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_STATISTIQUE_DESCRIPTIVE } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizStatistiqueDescriptive; label: string }[] = [
  { id: "vocabulaire", label: "Vocabulaire de base" },
  { id: "effectifsFrequences", label: "Tableaux d'effectifs et de fréquences" },
  { id: "graphiques", label: "Représentations graphiques" },
  { id: "mode", label: "Mode et classe modale" },
  { id: "moyenne", label: "Moyenne arithmétique et pondérée" },
  { id: "medianeQuartiles", label: "Médiane et quartiles" },
  { id: "dispersion", label: "Étendue, variance, écart-type" },
  { id: "boiteMoustaches", label: "Boîte à moustaches" },
  { id: "bienaymeTchebychev", label: "Inégalité de Bienaymé-Tchebychev" },
  { id: "comparaisonSeries", label: "Comparer deux séries statistiques" },
];

function tirerQuestion(varianteId: VarianteQuizStatistiqueDescriptive): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_STATISTIQUE_DESCRIPTIVE[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizStatistiqueDescriptive,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizStatistiqueDescriptive {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizStatistiqueDescriptive(): ExerciceQuizStatistiqueDescriptive {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizStatistiqueDescriptive`)
 * pourrait répéter une question avant d'avoir couvert les 19 autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `AppQuizStatistiqueDescriptive.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizStatistiqueDescriptive): GenerateurExerciceQuizStatistiqueDescriptive {
  const banque = BANQUE_QUIZ_STATISTIQUE_DESCRIPTIVE[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
