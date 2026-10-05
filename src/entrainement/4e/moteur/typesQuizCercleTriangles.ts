/**
 * Couche B — types de session pour "Cercle trigonométrique & triangles quelconques" (quiz
 * vrai/faux, chapitre 3 dans la nomenclature du projet). Structure identique à
 * `typesQuizFonctionsReference.ts` (gen62) et aux 3 quiz précédents : **mono-écran, une seule
 * tentative** (jamais de `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de
 * sens ici — CLAUDE.md, "Aide progressive additive... max=0 → pas de bouton").
 */
import type { ExerciceQuizCercleTriangles, GenerateurExerciceQuizCercleTriangles, QuestionVraiFaux, VarianteQuizCercleTriangles } from "../core/quizCercleTriangles.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceQuizCercleTriangles {
  variante: VarianteQuizCercleTriangles;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizCercleTriangles {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceQuizCercleTriangles;
  indexExercice: number;
  exerciceCourant: ExerciceQuizCercleTriangles;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizCercleTriangles[];
  terminee: boolean;
}
