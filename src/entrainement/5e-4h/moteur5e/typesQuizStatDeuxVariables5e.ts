/**
 * Couche B (5e) — types de session pour "Statistique à deux variables" (quiz vrai/faux, chapitre 6,
 * 5gen82). Structure identique au quiz vrai/faux du chapitre 4 (`moteur5e/typesQuizLimites5e.ts`,
 * 5gen42), du chapitre 3 (`moteur5e/typesQuizSuites5e.ts`, 5gen41), du chapitre 2
 * (`moteur5e/typesQuizTrigonometrie5e.ts`, 5gen40) et du chapitre 1
 * (`moteur5e/typesQuizFonctions5e.ts`, 5gen39) : **mono-écran, une seule tentative** (jamais de
 * `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de sens ici — CLAUDE.md,
 * "Aide progressive additive... max=0 → pas de bouton"). `ReglagesSession5e`
 * (`core5e/session5e.types.ts`), jamais le `ReglagesSession` du 4e.
 */
import type { ExerciceQuizStatDeuxVariables5e, GenerateurExerciceQuizStatDeuxVariables5e, QuestionVraiFaux5e, VarianteQuizStatDeuxVariables5e } from "../core5e/quizStatDeuxVariables5e.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizStatDeuxVariables5e {
  variante: VarianteQuizStatDeuxVariables5e;
  question: QuestionVraiFaux5e;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizStatDeuxVariables5e {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceQuizStatDeuxVariables5e;
  indexExercice: number;
  exerciceCourant: ExerciceQuizStatDeuxVariables5e;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizStatDeuxVariables5e[];
  terminee: boolean;
}
