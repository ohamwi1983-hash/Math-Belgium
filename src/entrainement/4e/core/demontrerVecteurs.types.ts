/**
 * Couche core — « Démontrer avec des vecteurs » (gen85, 4e, chapitre 6, section « colinearite »,
 * processus 3 TRANSFÉRER).
 *
 * Raisonnement vectoriel SANS repère : une figure de base (parallélogramme ABCD, triangle ABC ou
 * trapèze ABCD) et deux points E, F définis par des relations vectorielles. On démontre une
 * propriété (trois points alignés, deux droites parallèles, un milieu, un parallélogramme) en
 * exprimant deux vecteurs utiles dans une base adaptée, puis en comparant leurs coefficients.
 *
 * Toutes les positions sont des coefficients EXACTS (rationnels) dans la base adaptée : un point X
 * est repéré par (x ; y) tels que AX = x·AB + y·AD (parallélogramme, trapèze) ou
 * AX = x·AB + y·AC (triangle).
 */

export type FigureBase = "parallelogramme" | "triangle" | "trapeze";

export type TypeConclusion = "alignes" | "paralleles" | "milieu" | "parallelogramme";

/** Nombre rationnel exact, toujours réduit, dénominateur > 0. */
export interface Rationnel {
  n: number;
  d: number;
}

/** Coefficients d'un point (depuis A) ou d'un vecteur dans la base adaptée. */
export interface Coefficients {
  x: Rationnel;
  y: Rationnel;
}

/** Vecteur désigné par deux points de la figure (noms). */
export interface VecteurNomme {
  de: string;
  vers: string;
}

/** Point défini par une relation vectorielle à partir des sommets : vecteur(origine → nom) =
 * k · vecteur(de → vers). Même origine (`de === origine`) : le point est sur la droite (origine,
 * vers) — k = 1/2 se lit « milieu », k = 2 ou −1 « symétrique ». Sinon (`de ≠ origine`) : le point
 * est sur la parallèle à (de, vers) menée par `origine` (ex. vecteur CF = vecteur AB). */
export interface PointDefini {
  nom: string;
  origine: string;
  de: string;
  vers: string;
  k: Rationnel;
}

/** Ce qu'il faut démontrer (la propriété est VRAIE par construction). */
export type Cible =
  | { type: "alignes"; points: [string, string, string] }
  | { type: "paralleles"; droite1: [string, string]; droite2: [string, string] }
  | { type: "milieu"; milieu: string; extremites: [string, string] }
  | { type: "parallelogramme"; sommets: [string, string, string, string] };

/** Les trois bases proposées à l'écran 1. */
export type IdBase = "adaptee" | "colineaire" | "maladroite";

export interface OptionBase {
  id: IdBase;
  u: VecteurNomme;
  v: VecteurNomme;
}

/** Les quatre conclusions proposées à l'écran 4 (une seule correcte). */
export type IdConclusion = "juste" | "piege" | "piege2" | "rien";

export interface ExerciceDemontrerVecteurs {
  figure: FigureBase;
  /** Trapèze : vecteur DC = t · vecteur AB (0 < t < 1). Sans objet sinon. */
  t: Rationnel | null;
  /** E puis F. */
  definis: PointDefini[];
  cible: Cible;
  /** Vecteurs utiles : on démontre v = k·w. */
  w: VecteurNomme;
  v: VecteurNomme;
  /** Ordre d'affichage des bases (écran 1) et des conclusions (écran 4), tiré une fois. */
  bases: OptionBase[];
  ordreConclusions: IdConclusion[];
}
