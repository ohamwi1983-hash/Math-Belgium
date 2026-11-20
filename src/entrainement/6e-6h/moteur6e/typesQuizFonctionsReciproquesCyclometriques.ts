/**
 * Couche B (6e) — types de session pour "Fonctions réciproques et cyclométriques" (quiz vrai/faux,
 * 6gen64, chapitre 1). Structure identique à 6gen65 : **mono-écran, une seule tentative** (jamais
 * de `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de sens ici — CLAUDE.md,
 * "Aide progressive additive... max=0 → pas de bouton").
 */
import type {
  ExerciceQuizFonctionsReciproquesCyclometriques,
  GenerateurExerciceQuizFonctionsReciproquesCyclometriques,
  QuestionVraiFaux,
  VarianteQuizFonctionsReciproquesCyclometriques,
} from "../core6e/quizFonctionsReciproquesCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceQuizFonctionsReciproquesCyclometriques {
  variante: VarianteQuizFonctionsReciproquesCyclometriques;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizFonctionsReciproquesCyclometriques {
  reglages: ReglagesSession6e;
  generateur: GenerateurExerciceQuizFonctionsReciproquesCyclometriques;
  indexExercice: number;
  exerciceCourant: ExerciceQuizFonctionsReciproquesCyclometriques;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizFonctionsReciproquesCyclometriques[];
  terminee: boolean;
}
