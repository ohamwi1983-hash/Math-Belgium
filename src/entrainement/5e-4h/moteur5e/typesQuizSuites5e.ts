/**
 * Couche B (5e) — types de session pour "Suites" (quiz vrai/faux, chapitre 3, 5gen41).
 * Structure identique au quiz vrai/faux du chapitre 2 (`moteur5e/typesQuizTrigonometrie5e.ts`,
 * 5gen40) et du chapitre 1 (`moteur5e/typesQuizFonctions5e.ts`, 5gen39) : **mono-écran, une seule
 * tentative** (jamais de `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de
 * sens ici — CLAUDE.md, "Aide progressive additive... max=0 → pas de bouton"). `ReglagesSession5e`
 * (`core5e/session5e.types.ts`), jamais le `ReglagesSession` du 4e.
 */
import type { ExerciceQuizSuites5e, GenerateurExerciceQuizSuites5e, QuestionVraiFaux5e, VarianteQuizSuites5e } from "../core5e/quizSuites5e.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizSuites5e {
  variante: VarianteQuizSuites5e;
  question: QuestionVraiFaux5e;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizSuites5e {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceQuizSuites5e;
  indexExercice: number;
  exerciceCourant: ExerciceQuizSuites5e;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizSuites5e[];
  terminee: boolean;
}
