/**
 * Couche B (6e) — types de session pour "Lieux géométriques" (quiz vrai/faux, 6gen72, ajout
 * ultérieur au chapitre "Lieux géométriques"). Structure identique à 6gen71
 * (`typesQuizVariablesAleatoires.ts`) et 6gen70/69/68/67/66/65/64 : **mono-écran, une seule
 * tentative** (jamais de `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de
 * sens ici — CLAUDE.md, "Aide progressive additive... max=0 → pas de bouton").
 */
import type {
  ExerciceQuizLieuxGeometriques,
  GenerateurExerciceQuizLieuxGeometriques,
  QuestionVraiFaux,
  VarianteQuizLieuxGeometriques,
} from "../core6e/quizLieuxGeometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizLieuxGeometriques {
  variante: VarianteQuizLieuxGeometriques;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizLieuxGeometriques {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizLieuxGeometriques;
  indexExercice: number;
  exerciceCourant: ExerciceQuizLieuxGeometriques;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizLieuxGeometriques[];
  terminee: boolean;
}
