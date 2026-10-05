/**
 * Couche B (5e) — types de session pour "Limites et asymptotes" (quiz vrai/faux, chapitre 4, 5gen42).
 * Structure identique au quiz vrai/faux du chapitre 3 (`moteur5e/typesQuizSuites5e.ts`, 5gen41), du
 * chapitre 2 (`moteur5e/typesQuizTrigonometrie5e.ts`, 5gen40) et du chapitre 1
 * (`moteur5e/typesQuizFonctions5e.ts`, 5gen39) : **mono-écran, une seule tentative** (jamais de
 * `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de sens ici — CLAUDE.md,
 * "Aide progressive additive... max=0 → pas de bouton"). `ReglagesSession5e`
 * (`core5e/session5e.types.ts`), jamais le `ReglagesSession` du 4e.
 */
import type { ExerciceQuizLimites5e, GenerateurExerciceQuizLimites5e, QuestionVraiFaux5e, VarianteQuizLimites5e } from "../core5e/quizLimites5e.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizLimites5e {
  variante: VarianteQuizLimites5e;
  question: QuestionVraiFaux5e;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizLimites5e {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceQuizLimites5e;
  indexExercice: number;
  exerciceCourant: ExerciceQuizLimites5e;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizLimites5e[];
  terminee: boolean;
}
