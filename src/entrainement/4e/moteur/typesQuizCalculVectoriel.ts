/**
 * Couche B — types de session pour "Calcul vectoriel" (quiz vrai/faux, chapitre 4 dans la
 * nomenclature du projet). Structure identique à `typesQuizCercleTriangles.ts` (gen63) et aux 4
 * quiz précédents : **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2 réponses
 * possibles, aucune aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive additive...
 * max=0 → pas de bouton").
 */
import type { ExerciceQuizCalculVectoriel, GenerateurExerciceQuizCalculVectoriel, QuestionVraiFaux, VarianteQuizCalculVectoriel } from "../core/quizCalculVectoriel.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceQuizCalculVectoriel {
  variante: VarianteQuizCalculVectoriel;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizCalculVectoriel {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceQuizCalculVectoriel;
  indexExercice: number;
  exerciceCourant: ExerciceQuizCalculVectoriel;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizCalculVectoriel[];
  terminee: boolean;
}
