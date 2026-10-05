/**
 * Couche B — types de session pour "La fonction du second degré" (quiz vrai/faux, ajout ultérieur
 * au chapitre 1). Structure identique à `typesQuizStatistiqueDescriptive.ts` (gen59) : **mono-écran,
 * une seule tentative** (jamais de `niveauAide` : avec 2 réponses possibles, aucune aide progressive
 * n'a de sens ici — CLAUDE.md, "Aide progressive additive... max=0 → pas de bouton").
 */
import type { ExerciceQuizFonctionSecondDegre, GenerateurExerciceQuizFonctionSecondDegre, QuestionVraiFaux, VarianteQuizFonctionSecondDegre } from "../core/quizFonctionSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceQuizFonctionSecondDegre {
  variante: VarianteQuizFonctionSecondDegre;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizFonctionSecondDegre {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceQuizFonctionSecondDegre;
  indexExercice: number;
  exerciceCourant: ExerciceQuizFonctionSecondDegre;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizFonctionSecondDegre[];
  terminee: boolean;
}
