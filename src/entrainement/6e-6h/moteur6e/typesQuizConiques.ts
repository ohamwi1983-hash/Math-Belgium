/**
 * Couche B (6e) — types de session pour "Les coniques" (quiz vrai/faux, 6gen73, ajout ultérieur au
 * chapitre "Les coniques"). Structure identique à 6gen72 (`typesQuizLieuxGeometriques.ts`) et
 * 6gen71/70/69/68/67/66/65 : **mono-écran, une seule tentative** (jamais de `niveauAide` : avec 2
 * réponses possibles, aucune aide progressive n'a de sens ici — CLAUDE.md, "Aide progressive
 * additive... max=0 → pas de bouton").
 */
import type {
  ExerciceQuizConiques,
  GenerateurExerciceQuizConiques,
  QuestionVraiFaux,
  VarianteQuizConiques,
} from "../core6e/quizConiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizConiques {
  variante: VarianteQuizConiques;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizConiques {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizConiques;
  indexExercice: number;
  exerciceCourant: ExerciceQuizConiques;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizConiques[];
  terminee: boolean;
}
