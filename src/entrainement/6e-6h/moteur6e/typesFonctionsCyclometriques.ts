/**
 * Couche B (6e) — types de session pour `6gen2` (REFONTE TOTALE). ÉCRAN UNIQUE quelle que soit la
 * variante tirée (spec : les 3 mécaniques de calcul sont fusionnées en interne, jamais montrées
 * séparément à l'élève) — contrairement à la quasi-totalité des autres générateurs 6e, AUCUNE
 * machinerie de phase (`PhaseXxx`/`phaseInitiale`/`phaseApres`) n'est nécessaire ici : un seul
 * écran est traversé par exercice, jamais une chaîne à plusieurs. `EtatActuelPanel` (bloc "état
 * actuel") n'a, pour la même raison, AUCUN site d'utilisation possible dans ce générateur — il est
 * dérivé d'un écran PRÉCÉDENT déjà confirmé, et il n'y en a jamais ici (choix vérifié et documenté
 * ici, conformément au spec).
 */
import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceFonctionsCyclometriques {
  exercice: ExerciceFonctionsCyclometriques;
  score: number;
  revele: boolean;
}

export interface EtatSessionFonctionsCyclometriques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceFonctionsCyclometriques;
  exerciceCourant: ExerciceFonctionsCyclometriques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  indexExercice: number;
  resultats: ResultatExerciceFonctionsCyclometriques[];
  terminee: boolean;
}
