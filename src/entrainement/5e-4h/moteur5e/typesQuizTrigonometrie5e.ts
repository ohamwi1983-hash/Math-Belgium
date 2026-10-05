/**
 * Couche B (5e) — types de session pour "Trigonométrie" (quiz vrai/faux, chapitre 2, 5gen40).
 * Structure identique au quiz vrai/faux du chapitre 1 (`moteur5e/typesQuizFonctions5e.ts`, 5gen39) et
 * au quiz vrai/faux 4e (`moteur/typesQuizFonctionsReference.ts`, gen59-62) : **mono-écran, une seule
 * tentative** (jamais de `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de
 * sens ici — CLAUDE.md, "Aide progressive additive... max=0 → pas de bouton"). `ReglagesSession5e`
 * (`core5e/session5e.types.ts`), jamais le `ReglagesSession` du 4e.
 */
import type { ExerciceQuizTrigonometrie5e, GenerateurExerciceQuizTrigonometrie5e, QuestionVraiFaux5e, VarianteQuizTrigonometrie5e } from "../core5e/quizTrigonometrie5e.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizTrigonometrie5e {
  variante: VarianteQuizTrigonometrie5e;
  question: QuestionVraiFaux5e;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizTrigonometrie5e {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceQuizTrigonometrie5e;
  indexExercice: number;
  exerciceCourant: ExerciceQuizTrigonometrie5e;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizTrigonometrie5e[];
  terminee: boolean;
}
