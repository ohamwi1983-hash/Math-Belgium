import type { ExerciceGraphiquesCyclometriques } from "../core6e/graphiquesCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types pour `6gen5`. Écran unique en deux temps (audit du 6e ch. 1, lot B, G2) :
 * 1. choix du graphique (A–D) : choix fermé, UNE tentative — faux, l'écran se clôt (réponse
 *    révélée) ; juste, `lettreValidee` passe à vrai sans consommer de tentative ;
 * 2. justification (ordonnée, domaine, image, parité, extremums) : trois tentatives, sauf la parité
 *    (choix fermé) jugée une seule fois — fausse, elle est figée et révélée (`pariteRevelee`) et les
 *    autres champs gardent leurs tentatives.
 */

export interface ResultatExerciceGraphiquesCyclometriques {
  exercice: ExerciceGraphiquesCyclometriques;
  score: number;
}

export interface EtatSessionGraphiquesCyclometriques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceGraphiquesCyclometriques;
  exerciceCourant: ExerciceGraphiquesCyclometriques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  indexExercice: number;
  resultats: ResultatExerciceGraphiquesCyclometriques[];
  terminee: boolean;
  derniereRevelee: boolean;
  /** Le bon graphique a été choisi : la justification est ouverte. */
  lettreValidee: boolean;
  /** Parité fausse une fois : figée et révélée (choix fermé, une tentative). */
  pariteRevelee: boolean;
}
