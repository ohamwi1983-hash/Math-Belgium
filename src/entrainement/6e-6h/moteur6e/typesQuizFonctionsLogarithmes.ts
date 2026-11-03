/**
 * Couche B (6e) — types de session pour "Fonctions logarithmes" (quiz vrai/faux, 6gen66, ajout
 * ultérieur au chapitre 3). Structure identique à 6gen65 (`typesQuizFonctionsExponentielles.ts`) et
 * 6gen64 : **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2 réponses possibles,
 * aucune aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive additive... max=0 → pas de
 * bouton").
 */
import type {
  ExerciceQuizFonctionsLogarithmes,
  GenerateurExerciceQuizFonctionsLogarithmes,
  QuestionVraiFaux,
  VarianteQuizFonctionsLogarithmes,
} from "../core6e/quizFonctionsLogarithmes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizFonctionsLogarithmes {
  variante: VarianteQuizFonctionsLogarithmes;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizFonctionsLogarithmes {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizFonctionsLogarithmes;
  indexExercice: number;
  exerciceCourant: ExerciceQuizFonctionsLogarithmes;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizFonctionsLogarithmes[];
  terminee: boolean;
}
