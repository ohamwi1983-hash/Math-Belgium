// Copie 5e (6h) de `5e-4h/generateurs5e/quizSuites5e/index.ts` (56gen13 ← 5gen41, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
/**
 * Quiz vrai/faux 56gen13 « Nombres réels et suites » (5e (6h)), copie enrichie de 5gen41 (5e (4h)) :
 * 16 thèmes (réels, suites, algèbre financière), dans l'ordre des étapes du cours. Tire une question dans la banque
 * pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération procédurale, voir
 * `core5e/quizSuites5e.types.ts`. Structure mécaniquement identique au quiz vrai/faux du chapitre 2
 * (`generateurs5e/quizTrigonometrie5e/index.ts`, 5gen40), du chapitre 1
 * (`generateurs5e/quizFonctions5e/index.ts`, 5gen39) et au quiz vrai/faux 4e
 * (`generateurs/quizFonctionsReference/index.ts`, gen59-62).
 */
import type { ExerciceQuizSuites5e, GenerateurExerciceQuizSuites5e, QuestionVraiFaux5e, VarianteQuizSuites5e } from "./core/quizSuites5e.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_NOMBRES_REELS_SUITES } from "./banqueChapitre";

export const CATALOGUE_VARIANTES: { id: VarianteQuizSuites5e; label: string }[] = [
  { id: "irrationnels", label: "Rationnels et irrationnels" },
  { id: "ecrituresDecimales", label: "Écritures décimales" },
  { id: "quantificateursAxiomes", label: "Quantificateurs et axiomes" },
  { id: "valeurAbsolue", label: "Valeur absolue" },
  { id: "densiteApproximation", label: "Encadrer, approcher, densité" },
  { id: "suiteRecurrenteAffine", label: "Suite récurrente affine et point fixe" },
  { id: "suitesArithmetiques", label: "Suites arithmétiques" },
  { id: "suitesGeometriques", label: "Suites géométriques" },
  { id: "comparaisonNumerique", label: "Comparaison numérique de deux suites" },
  { id: "convergenceDivergence", label: "Convergence et divergence" },
  { id: "problemesClassiques", label: "Problèmes classiques sur les suites" },
  { id: "transversal", label: "Synthèse sur les suites" },
  { id: "interetsSimplesComposes", label: "Intérêt simple, intérêts composés" },
  { id: "tauxEquivalents", label: "Taux équivalents" },
  { id: "annuites", label: "Annuités" },
  { id: "creditTaeg", label: "Crédit et TAEG" },
];

/** Nombre d'affirmations du thème (14 à 20 selon le thème) : la longueur d'une session, lue à chaque
 * nouvelle session (règle de `.claude/rules/quiz-generators.md` : jamais une constante fixe). */
export function nombreQuestions(varianteId: VarianteQuizSuites5e): number {
  return BANQUE_QUIZ_NOMBRES_REELS_SUITES[varianteId].length;
}

function tirerQuestion(varianteId: VarianteQuizSuites5e): QuestionVraiFaux5e {
  const banque = BANQUE_QUIZ_NOMBRES_REELS_SUITES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizSuites5e,
  overrides?: { question?: QuestionVraiFaux5e },
): ExerciceQuizSuites5e {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizSuites5e(): ExerciceQuizSuites5e {
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
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (14 à 20) : sans
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizSuites5e`) pourrait
 * répéter une question avant d'avoir couvert les 19 autres. État interne (file mélangée, ré-mélangée
 * à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de cette fonction
 * — voir `App5gen41.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizSuites5e): GenerateurExerciceQuizSuites5e {
  const banque = BANQUE_QUIZ_NOMBRES_REELS_SUITES[varianteId];
  let file: QuestionVraiFaux5e[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux5e;
    return { variante: varianteId, question };
  };
}
