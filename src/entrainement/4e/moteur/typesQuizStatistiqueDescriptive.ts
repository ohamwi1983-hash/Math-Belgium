/**
 * Couche B — types de session pour "Statistique descriptive à une variable" (quiz vrai/faux,
 * chapitre 5, dixième générateur du chapitre). **Mono-écran, une seule tentative** (jamais de
 * `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de sens ici — CLAUDE.md,
 * "Aide progressive additive... max=0 → pas de bouton") — voir
 * `moteur/sessionQuizStatistiqueDescriptive.ts`.
 */
import type { ExerciceQuizStatistiqueDescriptive, GenerateurExerciceQuizStatistiqueDescriptive, QuestionVraiFaux, VarianteQuizStatistiqueDescriptive } from "../core/quizStatistiqueDescriptive.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceQuizStatistiqueDescriptive {
  variante: VarianteQuizStatistiqueDescriptive;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizStatistiqueDescriptive {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceQuizStatistiqueDescriptive;
  indexExercice: number;
  exerciceCourant: ExerciceQuizStatistiqueDescriptive;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizStatistiqueDescriptive[];
  terminee: boolean;
}
