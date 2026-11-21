import type { TermeVecteur } from "../moteur/expressionChasles";

/**
 * Couche core — « Chasles sans figure : réduire et démontrer une égalité vectorielle » (gen130,
 * 4e, chapitre 6 « Calcul vectoriel », § 6, processus 2 APPLIQUER). Calcul littéral sur des
 * vecteurs nommés par deux points, sans figure ni repère. Deux écrans par variante.
 */

export type VarianteChasles = "reduire" | "demontrer" | "inserer" | "coefficients";

/** Réduire : chaîne de n vecteurs (fermée ou non), certains écrits « à l'envers » avec un « − »,
 * dans le désordre. */
export interface ExerciceReduire {
  variante: "reduire";
  /** Points de la chaîne, dans l'ordre (chaîne fermée : le dernier vecteur revient au premier). */
  chaine: string[];
  ferme: boolean;
  /** Termes affichés, dans l'ordre de l'énoncé. */
  termes: TermeVecteur[];
  nbRetournes: number;
}

/** Simplifier : k·XY + k·YZ (un des deux éventuellement écrit −k·ZY ou −k·YX) + c·XZ (ou −c·ZX). */
export interface ExerciceCoefficients {
  variante: "coefficients";
  X: string;
  Y: string;
  Z: string;
  k: number;
  c: number;
  /** Les deux termes de coefficient ±k, dans l'ordre de la chaîne (XY puis YZ), tels qu'écrits. */
  groupe: [TermeVecteur, TermeVecteur];
  /** Troisième terme, tel qu'écrit. */
  troisieme: TermeVecteur;
  termes: TermeVecteur[];
  retourneK: boolean;
  retourneC: boolean;
}

/** Démontrer : « échange » PQ + RS = PS + RQ (insérer un point) ou « différence »
 * PQ − RQ = PS − RS (réduire chaque membre). */
export interface ExerciceDemontrer {
  variante: "demontrer";
  sousForme: "echange" | "difference";
  P: string;
  Q: string;
  R: string;
  S: string;
  gauche: TermeVecteur[];
  droite: TermeVecteur[];
  /** Échange : point inséré à la bonne première ligne (S dans PQ, ou Q dans RS). */
  insere: "S" | "Q";
  /** Ordre d'affichage des quatre premières lignes proposées (0 = la juste). */
  ordre: number[];
}

/** Insérer un point : « milieu » (MA + MB = 2·MI) ou « point » (a·MA + b·MB = 0 ⟹ AM = b/(a+b)·AB). */
export interface ExerciceInserer {
  variante: "inserer";
  sousForme: "milieu" | "point";
  /** Extrémités du segment. */
  A: string;
  B: string;
  /** Milieu (milieu) ou point inconnu (point). */
  I: string;
  /** Point quelconque (milieu seulement). */
  M: string;
  a: number;
  b: number;
}

export type ExerciceChaslesSansFigure = ExerciceReduire | ExerciceCoefficients | ExerciceDemontrer | ExerciceInserer;
