/**
 * Couche B (5e) — types pour 5gen25 ("Association graphique/mots ↔ signe de f'/f''"). N'importe
 * jamais rien de `src/generateurs5e/`. Contrairement aux autres générateurs 5e, chaque exercice
 * tient sur UN SEUL écran — pas de champ `phase` (une seule étape de tentatives par exercice).
 */
import type { ExerciceAssociation } from "../core5e/association.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesSession5e } from "../core5e/session5e.types";

export interface ResultatExerciceAssociation {
  exercice: ExerciceAssociation;
  score: number;
  /** Niveau d'aide utilisé et révélation — capturés à la clôture (exercice tenant sur un seul
   * écran, donc un seul couple aide/révélation par exercice, jamais par ligne). */
  niveauAide: number;
  revele: boolean;
}

export interface EtatSessionAssociation {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceAssociation;
  exerciceCourant: ExerciceAssociation;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  indexExercice: number;
  resultats: ResultatExerciceAssociation[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
