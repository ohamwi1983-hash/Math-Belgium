/**
 * Couche B (6e) — types de session pour "Analyse combinatoire" (quiz vrai/faux, 6gen70, ajout
 * ultérieur au chapitre 9). Structure identique à 6gen69 (`typesQuizProbabilites.ts`) et
 * 6gen68/67/66/65/64 : **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2
 * réponses possibles, aucune aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive
 * additive... max=0 → pas de bouton").
 */
import type {
  ExerciceQuizCombinatoire,
  GenerateurExerciceQuizCombinatoire,
  QuestionVraiFaux,
  VarianteQuizCombinatoire,
} from "../core6e/quizCombinatoire.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizCombinatoire {
  variante: VarianteQuizCombinatoire;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizCombinatoire {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizCombinatoire;
  indexExercice: number;
  exerciceCourant: ExerciceQuizCombinatoire;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizCombinatoire[];
  terminee: boolean;
}
