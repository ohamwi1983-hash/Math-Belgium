/**
 * Couche core — « Résoudre complètement un triangle » (gen73, 4e, chapitre 5, section « triangle »,
 * processus 2 APPLIQUER).
 *
 * Un triangle ABC (côté a = BC opposé au sommet A, b = AC opposé à B, c = AB opposé à C) est donné
 * par EXACTEMENT 3 éléments ; l'élève reconnaît la configuration, choisit la première loi, calcule
 * les 3 éléments manquants dans l'ordre de la méthode, puis contrôle son résultat.
 *
 * Quatre configurations (une variante chacune) :
 * - `AAS` : 2 angles et 1 côté (quel que soit le côté) ;
 * - `SAS` : 2 côtés et l'angle compris entre eux ;
 * - `SSS` : 3 côtés ;
 * - `SSA` : 2 côtés et un angle NON compris — seulement des cas à UN SEUL triangle (l'angle donné
 *   est opposé au plus grand des deux côtés donnés ; il peut être obtus). Le cas ambigu (0, 1 ou 2
 *   triangles) est un autre générateur (gen74).
 */
import type { CoteTriangle, SommetTriangle, Triangle } from "./triangle.types";
import type { UniteLongueur } from "./triangleQuelconque.types";

export type ConfigurationResolution = "AAS" | "SAS" | "SSS" | "SSA";

/** Un élément du triangle : un côté (a, b, c) ou un angle (A, B, C). */
export type ElementTriangle = CoteTriangle | SommetTriangle;

/** Loi utilisée pour obtenir un élément (écran 2 : choix de la première). */
export type LoiResolution = "sinus" | "kashiCote" | "kashiAngle" | "somme";

/** Où se trouve l'angle obtus éventuel : aucun, parmi les données, ou parmi les inconnues. */
export type PositionObtus = "aucun" | "donne" | "calcule";

export interface ExerciceResoudreTriangle {
  configuration: ConfigurationResolution;
  /** Triangle COMPLET, calculé à partir des données exactes (jamais arrondi). */
  triangle: Triangle;
  /** Les 3 éléments donnés (valeurs entières : côtés et angles en degrés). */
  donnees: ElementTriangle[];
  unite: UniteLongueur;
}
