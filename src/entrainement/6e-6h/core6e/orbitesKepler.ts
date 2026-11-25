/**
 * Couche core — `6gen141` « Orbites et ellipses : Kepler » (6e ch. 10, § 1 et § 3, processus 3
 * TRANSFÉRER). Un astre décrit une orbite elliptique autour d'un corps central (première loi de Kepler :
 * le corps central occupe un FOYER, jamais le centre). Données : distances au périhélie q = a − c et à
 * l'aphélie Q = a + c (satellite : altitudes au périgée et à l'apogée, à augmenter du rayon terrestre).
 * Quatre écrans : a et c, coordonnées du corps central dans le repère de l'orbite (centre O, grand axe sur
 * Ox, périhélie du côté des abscisses positives : S(c ; 0)), l'excentricité e = c/a, le demi-petit axe
 * b = √(a² − c²) = √(qQ).
 */

export type VarianteKE = "planete" | "comete" | "satellite";
export type PhaseKE = "axes" | "foyer" | "excentricite" | "petitAxe";
export const PHASES_KE: PhaseKE[] = ["axes", "foyer", "excentricite", "petitAxe"];

export interface ExerciceKE {
  variante: VarianteKE;
  a: number;
  c: number;
  b: number;
  /** Rayon du corps central quand les données sont des altitudes (satellite : 6 400 km), sinon 0. */
  R: number;
}

export const RAYON_TERRE = 6400;
export const perihelie = (e: ExerciceKE): number => e.a - e.c;
export const aphelie = (e: ExerciceKE): number => e.a + e.c;
export const excentricite = (e: ExerciceKE): number => e.c / e.a;
export const unite = (e: ExerciceKE): string => ({ planete: "millions de km", comete: "UA", satellite: "km" })[e.variante];
