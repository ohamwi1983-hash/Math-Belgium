/**
 * Couche B (6e) — types de session pour "Variables aléatoires et lois de probabilités" (quiz
 * vrai/faux, 6gen71, ajout ultérieur au chapitre 10). Structure identique à 6gen70
 * (`typesQuizCombinatoire.ts`) et 6gen69/68/67/66/65/64 : **mono-écran, une seule tentative**
 * (jamais de `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de sens ici —
 * CLAUDE.md, "Aide progressive additive... max=0 → pas de bouton").
 */
import type {
  ExerciceQuizVariablesAleatoires,
  GenerateurExerciceQuizVariablesAleatoires,
  QuestionVraiFaux,
  VarianteQuizVariablesAleatoires,
} from "../core6e/quizVariablesAleatoires.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizVariablesAleatoires {
  variante: VarianteQuizVariablesAleatoires;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizVariablesAleatoires {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizVariablesAleatoires;
  indexExercice: number;
  exerciceCourant: ExerciceQuizVariablesAleatoires;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizVariablesAleatoires[];
  terminee: boolean;
}
