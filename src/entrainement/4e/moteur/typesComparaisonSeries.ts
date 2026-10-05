/**
 * Couche B — types de session pour "Comparaison de deux séries statistiques" (chapitre 5, huitième
 * et dernier générateur du chapitre). **Mono-écran, comme "Quel angle ?"/"Transformations
 * graphiques"** — pas de `Phase` : une seule question par exercice, tirée à la génération
 * (`exercice.question.type`), toujours terminale dès sa première soumission close.
 */
import type { ExerciceComparaisonSeries, GenerateurExerciceComparaisonSeries, TypeQuestionComparaisonSeries, VarianteComparaisonSeries } from "../core/comparaisonSeries.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceComparaisonSeries {
  variante: VarianteComparaisonSeries;
  typeQuestion: TypeQuestionComparaisonSeries;
  score: number;
  revele: boolean;
  niveauAide: number;
}

export interface EtatSessionComparaisonSeries {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceComparaisonSeries;
  indexExercice: number;
  exerciceCourant: ExerciceComparaisonSeries;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE de l'écran courant — un seul champ, remis à 0 à chaque nouvel exercice (un
   * seul écran non-terminal n'existant pas ici, tout exercice n'a jamais qu'UNE seule question). */
  niveauAide: number;
  resultats: ResultatExerciceComparaisonSeries[];
  terminee: boolean;
}
