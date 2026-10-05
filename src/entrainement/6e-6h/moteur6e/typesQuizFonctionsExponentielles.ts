/**
 * Couche B (6e) — types de session pour "Fonctions exponentielles" (quiz vrai/faux, 6gen65, ajout
 * ultérieur au chapitre 2). Structure identique à 6gen64 (`quizFonctionsReciproquesCyclometriques`)
 * et aux 4 quiz vrai/faux du chantier 4e (gen59-62) : **mono-écran, une seule tentative** (jamais
 * de `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de sens ici — CLAUDE.md,
 * "Aide progressive additive... max=0 → pas de bouton").
 */
import type {
  ExerciceQuizFonctionsExponentielles,
  GenerateurExerciceQuizFonctionsExponentielles,
  QuestionVraiFaux,
  VarianteQuizFonctionsExponentielles,
} from "../core6e/quizFonctionsExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizFonctionsExponentielles {
  variante: VarianteQuizFonctionsExponentielles;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizFonctionsExponentielles {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizFonctionsExponentielles;
  indexExercice: number;
  exerciceCourant: ExerciceQuizFonctionsExponentielles;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizFonctionsExponentielles[];
  terminee: boolean;
}
