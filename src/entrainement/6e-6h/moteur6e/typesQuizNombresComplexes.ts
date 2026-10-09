/**
 * Couche B (6e) — types de session pour "Nombres complexes" (quiz vrai/faux, 6gen68, ajout
 * ultérieur au chapitre 7). Structure identique à 6gen67 (`typesQuizIntegralesPrimitives.ts`) et
 * 6gen66/65 : **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2 réponses
 * possibles, aucune aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive additive...
 * max=0 → pas de bouton").
 */
import type {
  ExerciceQuizNombresComplexes,
  GenerateurExerciceQuizNombresComplexes,
  QuestionVraiFaux,
  VarianteQuizNombresComplexes,
} from "../core6e/quizNombresComplexes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizNombresComplexes {
  variante: VarianteQuizNombresComplexes;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizNombresComplexes {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizNombresComplexes;
  indexExercice: number;
  exerciceCourant: ExerciceQuizNombresComplexes;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizNombresComplexes[];
  terminee: boolean;
}
