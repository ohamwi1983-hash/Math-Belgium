/**
 * Couche A — "Fonctions réciproques et cyclométriques" (quiz vrai/faux), 6gen64, porté de
 * plateforme-maths (lot F de l'audit du chapitre 1). Tire une question dans la banque pré-écrite
 * (`banque.ts`) du thème (variante) actif — jamais de génération procédurale, voir
 * `core6e/quizFonctionsReciproquesCyclometriques.types.ts`. Structure identique à 6gen65
 * (`quizFonctionsExponentielles`).
 */
import type {
  ExerciceQuizFonctionsReciproquesCyclometriques,
  GenerateurExerciceQuizFonctionsReciproquesCyclometriques,
  QuestionVraiFaux,
  VarianteQuizFonctionsReciproquesCyclometriques,
} from "../../core6e/quizFonctionsReciproquesCyclometriques.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES } from "./banque";

/** Dans l'ordre des sections du cours (deux thèmes ajoutés au portage : compositions arc∘trig en
 * § 2, étude de fonction en § 6). */
export const CATALOGUE_VARIANTES: { id: VarianteQuizFonctionsReciproquesCyclometriques; label: string }[] = [
  { id: "injectiviteSurjectiviteBijectivite", label: "Injectivité, surjectivité, bijectivité" },
  { id: "fonctionsCyclometriques", label: "Les fonctions cyclométriques : arcsin, arccos, arctan" },
  { id: "compositionsArcTrig", label: "Composer arcfonction et fonction trigonométrique" },
  { id: "equationsCyclometriques", label: "Équations avec fonctions cyclométriques" },
  { id: "deriveesCyclometriques", label: "Dérivées des fonctions cyclométriques" },
  { id: "graphiquesCyclometriques", label: "Graphes et fonctions transformées" },
  { id: "etudeFonctionCyclometrique", label: "Étudier une fonction cyclométrique" },
];

/** Taille réelle de la banque d'un thème — jamais une constante en dur (convention
 * `.claude/rules/quiz-generators.md`) : une session parcourt exactement toutes les questions du
 * thème sans répétition. */
export function nombreQuestions(varianteId: VarianteQuizFonctionsReciproquesCyclometriques): number {
  return BANQUE_QUIZ_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES[varianteId].length;
}

/** Bornes min/max des tailles de thèmes, pour un texte d'accueil toujours exact. */
export function etendueNombreQuestions(): { min: number; max: number } {
  const tailles = CATALOGUE_VARIANTES.map((v) => nombreQuestions(v.id));
  return { min: Math.min(...tailles), max: Math.max(...tailles) };
}

function tirerQuestion(varianteId: VarianteQuizFonctionsReciproquesCyclometriques): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizFonctionsReciproquesCyclometriques,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizFonctionsReciproquesCyclometriques {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizFonctionsReciproquesCyclometriques(): ExerciceQuizFonctionsReciproquesCyclometriques {
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
 * (`genererExerciceQuizFonctionsReciproquesCyclometriques`) pourrait répéter une question avant d'avoir
 * couvert toutes les autres. État interne (file mélangée, ré-mélangée à chaque épuisement) enfermé
 * dans la fermeture, jamais partagé entre deux appels de cette fonction — voir `App6gen64.tsx`,
 * qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizFonctionsReciproquesCyclometriques,
): GenerateurExerciceQuizFonctionsReciproquesCyclometriques {
  const banque = BANQUE_QUIZ_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
