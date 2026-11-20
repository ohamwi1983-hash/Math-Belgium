/**
 * Couche core — `5gen57` « Modéliser des relevés réels par une sinusoïde » (5e ch. 2, § 8,
 * processus 3 TRANSFÉRER). Trois contextes aux ordres de grandeur réels : marée (heures et hauteurs
 * des pleines et basses mers), durée du jour (au 21 de plusieurs mois, selon la ville), températures
 * moyennes mensuelles. Les relevés sont les valeurs du modèle arrondies à la précision affichée :
 * le modèle construit à partir des extrêmes du tableau les suit donc honnêtement.
 */

export type VarianteReleves = "maree" | "jour" | "temperature";

export interface LigneReleve {
  /** Libellé lisible (« pleine mer », « 21 juin », « janvier »). */
  libelle: string;
  t: number;
  valeur: number;
  /** Heure « 3 h 12 » (marée). */
  heure?: string;
}

export interface ExerciceRelevesSinusoide {
  variante: VarianteReleves;
  /** Lieu (« un port de la mer du Nord », « Bruxelles »…). */
  lieu: string;
  /** Unité de la grandeur et du temps. */
  unite: string;
  uniteTemps: string;
  /** Décimales de la grandeur dans le tableau et pour la prévision. */
  decimales: number;
  releves: LigneReleve[];
  max: number;
  min: number;
  T: number;
  /** T lue entre deux maximums (marée) ou donnée (un an). */
  tDonnee: boolean;
  tMax: number;
  tMin: number;
  A: number;
  b: number;
  omega: number;
  phi: number;
  /** Prévision : instant et libellé (« à 7 h », « le 1er mai »). */
  tPrev: number;
  libellePrev: string;
  prevision: number;
  /** Seuil et durée par période au-dessus du seuil. */
  seuil: number;
  mSeuil: number;
  uSeuil: [number, number];
  duree: number;
  /** Décimales de la durée demandée. */
  decimalesDuree: number;
  cleCollecteur: string;
}

export function modele(e: ExerciceRelevesSinusoide, t: number): number {
  return e.A * Math.sin(e.omega * t + e.phi) + e.b;
}
