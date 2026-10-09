/**
 * Couche B (6e) — types de session pour "Probabilités" (quiz vrai/faux, 6gen69, ajout ultérieur au
 * chapitre 8). Structure identique à 6gen68 (`typesQuizNombresComplexes.ts`) et 6gen67/66/65/64 :
 * **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2 réponses possibles, aucune
 * aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive additive... max=0 → pas de
 * bouton").
 */
import type {
  ExerciceQuizProbabilites,
  GenerateurExerciceQuizProbabilites,
  QuestionVraiFaux,
  VarianteQuizProbabilites,
} from "../core6e/quizProbabilites.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizProbabilites {
  variante: VarianteQuizProbabilites;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizProbabilites {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizProbabilites;
  indexExercice: number;
  exerciceCourant: ExerciceQuizProbabilites;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizProbabilites[];
  terminee: boolean;
}
