/**
 * Couche B — types de session pour "Géométrie analytique plane" (quiz vrai/faux, chapitre 6 dans la
 * nomenclature du projet). Structure identique à `typesQuizCalculVectoriel.ts` (gen64) et aux 5 quiz
 * précédents : **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2 réponses
 * possibles, aucune aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive additive...
 * max=0 → pas de bouton").
 */
import type { ExerciceQuizGeometrieAnalytique, GenerateurExerciceQuizGeometrieAnalytique, QuestionVraiFaux, VarianteQuizGeometrieAnalytique } from "../core/quizGeometrieAnalytique.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceQuizGeometrieAnalytique {
  variante: VarianteQuizGeometrieAnalytique;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizGeometrieAnalytique {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceQuizGeometrieAnalytique;
  indexExercice: number;
  exerciceCourant: ExerciceQuizGeometrieAnalytique;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizGeometrieAnalytique[];
  terminee: boolean;
}
