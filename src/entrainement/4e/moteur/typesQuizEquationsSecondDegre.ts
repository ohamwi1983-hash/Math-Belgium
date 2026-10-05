/**
 * Couche B — types de session pour "Équations et inéquations du second degré" (quiz vrai/faux,
 * ajout ultérieur au chapitre 2). Structure identique à `typesQuizStatistiqueDescriptive.ts`
 * (gen59) et `typesQuizFonctionSecondDegre.ts` (gen60) : **mono-écran, une seule tentative**
 * (jamais de `niveauAide` : avec 2 réponses possibles, aucune aide progressive n'a de sens ici —
 * CLAUDE.md, "Aide progressive additive... max=0 → pas de bouton").
 */
import type { ExerciceQuizEquationsSecondDegre, GenerateurExerciceQuizEquationsSecondDegre, QuestionVraiFaux, VarianteQuizEquationsSecondDegre } from "../core/quizEquationsSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceQuizEquationsSecondDegre {
  variante: VarianteQuizEquationsSecondDegre;
  question: QuestionVraiFaux;
  reponseChoisie: boolean;
  score: number;
  revele: boolean;
}

export interface EtatSessionQuizEquationsSecondDegre {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceQuizEquationsSecondDegre;
  indexExercice: number;
  exerciceCourant: ExerciceQuizEquationsSecondDegre;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceQuizEquationsSecondDegre[];
  terminee: boolean;
}
