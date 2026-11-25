import type { Pt } from "./stat2vLotH1";

/**
 * Modèle de `5gen76` « Lire un nuage de points » (5e ch. 6, § 1–2, Connaître) :
 * - `forme` : un nuage → forme (à peu près alignés / en arc / qui « décolle » / sans forme) puis sens ;
 * - `intensite` : un nuage d'allure affine → sens (corrélation positive / négative) puis intensité à
 *   l'œil (forte / moyenne / faible, seuils du tableau du cours) ;
 * - `associer` : quatre nuages numérotés et quatre coefficients r → un écran par nuage.
 * Verdicts (forme, sens, intensité, classes de r) tirés à parts égales AVANT le nuage ; chaque nuage est
 * construit pour son verdict puis CONTRÔLÉ sur ses coordonnées (r réel recalculé, ajustement du second
 * degré pour l'arc, rapport des pentes pour l'exponentielle).
 */

export type VarianteLireNuage = "forme" | "intensite" | "associer";
export type FormeNuage = "affine" | "arc" | "decolle" | "aucune";
export type SensNuage = "croissant" | "decroissant" | "montePuisDescend" | "aucun";
export type IntensiteNuage = "forte" | "moyenne" | "faible";

export interface NuageGenere {
  points: Pt[];
  /** Coefficient de corrélation linéaire RÉEL des points (recalculé). */
  r: number;
  /** Courbe d'ajustement à montrer dans le corrigé (droite, parabole, exponentielle), absente pour « aucune ». */
  modele?: { genre: "droite"; a: number; b: number } | { genre: "parabole"; c: [number, number, number] } | { genre: "exponentielle"; k: number; c: number; q: number };
}

export interface ExerciceLireNuage {
  variante: VarianteLireNuage;
  /** `forme` */
  forme?: FormeNuage;
  sens?: SensNuage;
  /** `intensite` */
  intensite?: IntensiteNuage;
  positif?: boolean;
  /** Un nuage (`forme`, `intensite`) ou quatre (`associer`). */
  nuages: NuageGenere[];
  /** `associer` : coefficients proposés (r des nuages arrondis au centième), rangés par ordre croissant. */
  valeursR?: number[];
  /** `associer` : pour le nuage i, indice de son coefficient dans `valeursR`. */
  bonnes?: number[];
}
