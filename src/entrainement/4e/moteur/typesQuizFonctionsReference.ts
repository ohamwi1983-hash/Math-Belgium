/**
 * Couche B — types de session pour "Caractéristiques d'une fonction & fonctions de référence"
 * (quiz vrai/faux, chapitre 2, nommage propre à sa spec). Structure identique à
 * `typesQuizEquationsSecondDegre.ts` (gen61) et aux 2 quiz précédents (gen59/gen60) : **mono-écran,
 * une seule tentative** (jamais de `niveauAide` : avec 2 réponses possibles, aucune aide
 * progressive n'a de sens ici — CLAUDE.md, "Aide progressive additive... max=0 → pas de bouton").
 */
import type { ExerciceQuizFonctionsReference, GenerateurExerciceQuizFonctionsReference, QuestionVraiFaux, VarianteQuizFonctionsReference } from "../core/quizFonctionsReference.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceQuizFonctionsReference {
  variante: VarianteQuizFonctionsReference;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizFonctionsReference {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceQuizFonctionsReference;
  indexExercice: number;
  exerciceCourant: ExerciceQuizFonctionsReference;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizFonctionsReference[];
  terminee: boolean;
}
