import type { Morceau } from "./inequation.types";

/**
 * gen70 — Lire un graphique en contexte (4e, chapitre 3, processus TRANSFÉRER).
 *
 * Une situation concrète (température sur une journée, château d'eau, cycliste…) est représentée
 * par une courbe dont les axes portent une grandeur et une unité. L'exercice pose 4 questions en
 * langage courant ; pour chacune, l'élève identifie d'abord la caractéristique demandée (écran à
 * choix fermé, une seule tentative), puis fait la lecture (écran à saisie).
 */

export type IdContexteGraphique = "temperature" | "piscine" | "randonnee" | "reservoir" | "cycliste" | "cafe" | "population";

export type TypeQuestionGraphique = "image" | "antecedent" | "inequation" | "extremum" | "variation" | "tendance";

/** Comparaison demandée par une question d'inéquation : « au moins » (≥), « plus de » (>),
 * « moins de » (<), « au plus » (≤). */
export type ComparateurGraphique = ">=" | ">" | "<" | "<=";

export interface PointCle {
  x: number;
  y: number;
}

/**
 * Courbe d'un exercice — TOUJOURS déterminée par des points-clés situés sur des nœuds de la grille :
 * - `pchip` : interpolation cubique monotone (Fritsch–Carlson) — la courbe est monotone entre deux
 *   points-clés consécutifs, ses extremums sont des points-clés ;
 * - `lineaire` : segments de droite (paliers possibles) ;
 * - `saturation` : y = L + A·2^(−x/T) — valeurs exactes aux multiples de T (points-clés), tend vers L.
 */
export type CourbeGraphique =
  | { type: "pchip"; points: PointCle[]; pentes: number[] }
  | { type: "lineaire"; points: PointCle[] }
  | { type: "saturation"; L: number; A: number; T: number; points: PointCle[] };

export interface AxeGraphique {
  min: number;
  max: number;
  /** Pas de la grille. */
  pas: number;
  /** Pas des graduations chiffrées (multiple de `pas`). */
  pasEtiquette: number;
  /** Nom de la grandeur, ex. « température ». */
  nom: string;
  /** Unité, ex. « °C » (affichée entre parenthèses au bout de l'axe). */
  unite: string;
}

export type QuestionGraphique =
  | { type: "image"; x: number; y: number }
  | { type: "antecedent"; k: number; solutions: number[] }
  | { type: "inequation"; k: number; comparateur: ComparateurGraphique; solution: Morceau[] }
  | { type: "extremum"; nature: "max" | "min"; x: number; y: number }
  | { type: "variation"; sens: "croissante" | "decroissante"; intervalles: Morceau[] }
  | { type: "tendance"; L: number };

export interface ExerciceGraphiqueContexte {
  contexte: IdContexteGraphique;
  courbe: CourbeGraphique;
  axeX: AxeGraphique;
  axeY: AxeGraphique;
  /** Toujours 4 questions, de types deux à deux distincts, dans un ordre tiré au hasard. */
  questions: QuestionGraphique[];
}

/** Réponse saisie à l'écran de lecture (une forme par type de question). */
export type ReponseLectureGraphique =
  | { type: "image"; valeur: number }
  | { type: "antecedent"; valeurs: number[] }
  | { type: "inequation"; morceaux: Morceau[] }
  | { type: "extremum"; moment: number; valeur: number }
  | { type: "variation"; morceaux: Morceau[] }
  | { type: "tendance"; valeur: number };
