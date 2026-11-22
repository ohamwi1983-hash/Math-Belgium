import { arrondiDecimales, net } from "../ui5e/ecrituresApplicationsDerivees";

/**
 * Couche core — `5gen68` « Approximation affine » (5e ch. 5, § 2 « Tangentes », processus 2
 * APPLIQUER). Près de a, la courbe se confond avec sa tangente : f(a + h) ≈ f(a) + f′(a)·h.
 * Variantes :
 * - racine : √N avec a carré parfait (1, 4, 16, 25) — f′(a) = 1/(2√a) décimal exact ;
 * - puissance : Nⁿ avec a ∈ {1, 2, 10} — f′(a) = n·aⁿ⁻¹ ;
 * - inverse : 1/N avec a ∈ {1, 2, 4, 5, 10} — f′(a) = −1/a² décimal exact ;
 * - trigo : sin, tan en 0, sin en π, cos en π/2 (angles en RADIANS) — f(a) = 0, f′(a) = ±1 ;
 * - contexte : arête d'un cube (V(x) = x³) ou côté d'une plaque carrée (A(x) = x²) qui se dilate
 *   ou se contracte.
 * Cinq écrans : a et h, f′(x), f(a) et f′(a), approximation, erreur commise (écart à la valeur de la
 * calculatrice, à deux chiffres significatifs). Tout se fait sans calculatrice : la valeur de la
 * calculatrice est DONNÉE au dernier écran.
 */

export type VarianteApproximationAffine = "racine" | "puissance" | "inverse" | "trigo" | "contexte";
export type FonctionApproximation = "racine" | "puissance" | "inverse" | "sin" | "cos" | "tan";

export interface ExerciceApproximationAffine {
  variante: VarianteApproximationAffine;
  fn: FonctionApproximation;
  /** Exposant (puissance ; contexte : 3 pour le cube, 2 pour la plaque). */
  n: number;
  /** Point a (valeur réelle ; trigo : 0, π ou π/2). */
  a: number;
  /** Trigo : a = aPi·π (0, 1 ou 1/2) ; 0 sinon. */
  aPi: number;
  /** Écart h (décimal, au plus deux décimales). */
  h: number;
  contexte: "cube" | "carre" | null;
}

type E = ExerciceApproximationAffine;

export function fonction(e: E): (x: number) => number {
  switch (e.fn) {
    case "racine":
      return Math.sqrt;
    case "puissance":
      return (x) => x ** e.n;
    case "inverse":
      return (x) => 1 / x;
    case "sin":
      return Math.sin;
    case "cos":
      return Math.cos;
    case "tan":
      return Math.tan;
  }
}

export function derivee(e: E): (x: number) => number {
  switch (e.fn) {
    case "racine":
      return (x) => 1 / (2 * Math.sqrt(x));
    case "puissance":
      return (x) => e.n * x ** (e.n - 1);
    case "inverse":
      return (x) => -1 / (x * x);
    case "sin":
      return Math.cos;
    case "cos":
      return (x) => -Math.sin(x);
    case "tan":
      return (x) => 1 / Math.cos(x) ** 2;
  }
}

/** f(a), exact (0 pour les fonctions trigonométriques). */
export function fa(e: E): number {
  if (e.aPi !== 0 || e.fn === "sin" || e.fn === "tan" || e.fn === "cos") return 0;
  return net(fonction(e)(e.a));
}

/** f′(a), exact (décimal). */
export function fpa(e: E): number {
  if (e.fn === "sin") return e.aPi === 1 ? -1 : 1;
  if (e.fn === "cos") return -1;
  if (e.fn === "tan") return 1;
  return net(derivee(e)(e.a));
}

/** Nombre à estimer N = a + h (valeur réelle). */
export const nombre = (e: E): number => e.a + e.h;

/** Approximation affine f(a) + f′(a)·h (décimal exact). */
export const approximation = (e: E): number => net(fa(e) + fpa(e) * e.h);

/** Valeur exacte f(a + h). */
export const valeurExacte = (e: E): number => fonction(e)(nombre(e));

/** Décimales affichées par la « calculatrice ». */
export const DECIMALES_CALCULATRICE = 9;

/** Valeur affichée par la calculatrice : exacte si elle tient en 9 décimales, sinon arrondie. */
export function valeurCalculatrice(e: E): { valeur: number; exacte: boolean } {
  const v = valeurExacte(e);
  const r = arrondiDecimales(v, DECIMALES_CALCULATRICE);
  return { valeur: net(r), exacte: Math.abs(r - v) < 1e-12 * Math.max(1, Math.abs(v)) };
}

/** Erreur commise : |valeur affichée − approximation| (calculée sur la valeur AFFICHÉE). */
export const erreur = (e: E): number => net(Math.abs(valeurCalculatrice(e).valeur - approximation(e)));

/** Points de contrôle de f′(x) (dans le domaine de f′, loin des valeurs interdites). */
export function pointsControle(e: E): number[] {
  if (e.fn === "racine" || e.fn === "inverse") return [0.5, 1.3, 2.7, 4.1, 9.2];
  if (e.fn === "puissance") return [-1.7, -0.6, 0.45, 1.3, 2.2];
  return [-1.1, -0.4, 0.3, 0.7, 1.2, 2.3];
}
