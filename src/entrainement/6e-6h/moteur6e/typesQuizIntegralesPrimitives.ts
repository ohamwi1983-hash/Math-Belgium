/**
 * Couche B (6e) — types de session pour "Intégrales et primitives" (quiz vrai/faux, 6gen67, ajout
 * ultérieur au chapitre 4). Structure identique à 6gen66 (`typesQuizFonctionsLogarithmes.ts`) et
 * 6gen65 : **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2 réponses possibles,
 * aucune aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive additive... max=0 → pas de
 * bouton").
 */
import type {
  ExerciceQuizIntegralesPrimitives,
  GenerateurExerciceQuizIntegralesPrimitives,
  QuestionVraiFaux,
  VarianteQuizIntegralesPrimitives,
} from "../core6e/quizIntegralesPrimitives.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizIntegralesPrimitives {
  variante: VarianteQuizIntegralesPrimitives;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizIntegralesPrimitives {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizIntegralesPrimitives;
  indexExercice: number;
  exerciceCourant: ExerciceQuizIntegralesPrimitives;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizIntegralesPrimitives[];
  terminee: boolean;
}
