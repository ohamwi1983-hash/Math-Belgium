/**
 * Banque complète du quiz vrai/faux 56gen13 « Nombres réels et suites » (5e (6h)) : thèmes des réels
 * (`banqueReels.ts`), des suites (`banque.ts`, reprise de 5gen41) et de l'algèbre financière
 * (`banqueFinance.ts`). Lue par l'appli (`index.ts`) ET par les évaluations (`lib/banquesVraiFaux.ts`,
 * chapitre `nombres-reels-suites`) : une seule source. Le nombre d'affirmations varie d'un thème à
 * l'autre (14 à 20) — l'appli lit la taille réelle (`nombreQuestions`), jamais une constante.
 */
import type { QuestionVraiFaux5e, VarianteQuizSuites5e } from "./core/quizSuites5e.types";
import { BANQUE_QUIZ_SUITES } from "./banque";
import { BANQUE_QUIZ_REELS } from "./banqueReels";
import { BANQUE_QUIZ_FINANCE } from "./banqueFinance";

export const BANQUE_QUIZ_NOMBRES_REELS_SUITES = {
  ...BANQUE_QUIZ_REELS,
  ...BANQUE_QUIZ_SUITES,
  ...BANQUE_QUIZ_FINANCE,
} as Record<VarianteQuizSuites5e, QuestionVraiFaux5e[]>;
