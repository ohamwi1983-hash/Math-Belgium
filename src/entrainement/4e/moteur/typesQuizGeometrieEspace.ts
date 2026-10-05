/**
 * Couche B — types de session pour "Géométrie dans l'espace" (quiz vrai/faux, chapitre 6 dans la
 * nomenclature du projet). Structure identique à `typesQuizGeometrieAnalytique.ts` (gen65) et aux 7
 * quiz précédents : **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2 réponses
 * possibles, aucune aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive additive...
 * max=0 → pas de bouton").
 */
import type { ExerciceQuizGeometrieEspace, GenerateurExerciceQuizGeometrieEspace, QuestionVraiFaux, VarianteQuizGeometrieEspace } from "../core/quizGeometrieEspace.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceQuizGeometrieEspace {
  variante: VarianteQuizGeometrieEspace;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizGeometrieEspace {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceQuizGeometrieEspace;
  indexExercice: number;
  exerciceCourant: ExerciceQuizGeometrieEspace;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizGeometrieEspace[];
  terminee: boolean;
}
