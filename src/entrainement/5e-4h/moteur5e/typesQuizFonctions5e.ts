/**
 * Couche B (5e) — types de session pour "Fonctions : rappels et compléments" (quiz vrai/faux,
 * chapitre 1, 5gen39). Structure identique au quiz vrai/faux 4e (`moteur/typesQuizFonctionsReference.ts`,
 * gen59-62) : **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2 réponses
 * possibles, aucune aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive additive...
 * max=0 → pas de bouton"). `ReglagesSession5e` (`core5e/session5e.types.ts`), jamais le
 * `ReglagesSession` du 4e.
 */
import type { ExerciceQuizFonctions5e, GenerateurExerciceQuizFonctions5e, QuestionVraiFaux5e, VarianteQuizFonctions5e } from "../core5e/quizFonctions5e.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizFonctions5e {
  variante: VarianteQuizFonctions5e;
  question: QuestionVraiFaux5e;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizFonctions5e {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceQuizFonctions5e;
  indexExercice: number;
  exerciceCourant: ExerciceQuizFonctions5e;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizFonctions5e[];
  terminee: boolean;
}
