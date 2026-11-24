import type { Ensemble } from "../moteur5e/ensemblesReels";
import { intervalle, normaliser } from "../moteur5e/ensemblesReels";

/**
 * Couche core — `5gen74` « Du graphique de f′ aux variations de f » (5e ch. 5, § 6, processus 2
 * APPLIQUER). Seul le graphique de f′ est donné (polynôme, f définie et dérivable sur ℝ) ; zéros et
 * extremums de f′ sur des nœuds du quadrillage (carreau = 1 unité). Variantes :
 * - `deuxZeros` : f′(x) = k((x − h)² − d²) — deux zéros simples, un maximum et un minimum de f ;
 * - `zeroDouble` : f′(x) = k(x − h)² — zéro double (sans changement de signe) : palier, aucun
 *   extremum ;
 * - `sansZero` : f′(x) = k((x − h)² + e) — f′ ne s'annule pas : f monotone ;
 * - `cubique` : f′(x) = k(x − a)²(x − b), b = a + 3t — un zéro double (palier) et un zéro simple
 *   (extremum), deux points d'inflexion (a et a + 2t).
 * Les trois premières forment le groupe à verdict « nombre d'extremums » (même allure de parabole).
 */

export type VarianteGraphiqueDerivee = "deuxZeros" | "zeroDouble" | "sansZero" | "cubique";

export interface ZeroDerivee {
  x: number;
  double: boolean;
}

export interface ExerciceGraphiqueDerivee {
  variante: VarianteGraphiqueDerivee;
  /** Coefficients de f′ (plus haut degré d'abord). */
  coefs: number[];
  /** Zéros de f′ (croissants). */
  zeros: ZeroDerivee[];
  /** Abscisses des extremums de f′ (= points d'inflexion de f), croissantes. */
  inflexions: number[];
}

type E = ExerciceGraphiqueDerivee;

export const FENETRE_FP = 5;

export const fp = (e: E, x: number): number => e.coefs.reduce((acc, c) => acc * x + c, 0);
export const fpp = (e: E, x: number): number => {
  const n = e.coefs.length - 1;
  return e.coefs.slice(0, -1).reduce((acc, c, i) => acc * x + c * (n - i), 0);
};

/** Bornes (zéros) qui découpent ℝ pour le signe de f′. */
const bornesSigne = (e: E): number[] => e.zeros.map((z) => z.x);

/** Morceaux de ℝ entre des bornes (−∞, b₁, …, bₙ, +∞) avec un point test dans chacun. */
export function morceaux(bornes: number[]): { g: number; d: number; test: number }[] {
  const b = [-Infinity, ...bornes, Infinity];
  const res: { g: number; d: number; test: number }[] = [];
  for (let i = 0; i < b.length - 1; i++) {
    const g = b[i]!;
    const d = b[i + 1]!;
    const test = !Number.isFinite(g) && !Number.isFinite(d) ? 0 : !Number.isFinite(g) ? d - 1 : !Number.isFinite(d) ? g + 1 : (g + d) / 2;
    res.push({ g, d, test });
  }
  return res;
}

/** Ensemble (ouvert) où une fonction a le signe `s`, découpé aux bornes. */
function ensembleSigne(fn: (x: number) => number, bornes: number[], s: 1 | -1): Ensemble {
  return normaliser(morceaux(bornes).filter((m) => Math.sign(fn(m.test)) === s).map((m) => intervalle(m.g, false, m.d, false)));
}

export const ensemblePositif = (e: E): Ensemble => ensembleSigne((x) => fp(e, x), bornesSigne(e), 1);
export const ensembleNegatif = (e: E): Ensemble => ensembleSigne((x) => fp(e, x), bornesSigne(e), -1);
/** Convexité (f′ croissante ⟺ f″ > 0) : ensembles ouverts, crochets libres à la saisie. */
export const ensembleConvexe = (e: E): Ensemble => ensembleSigne((x) => fpp(e, x), e.inflexions, 1);
export const ensembleConcave = (e: E): Ensemble => ensembleSigne((x) => fpp(e, x), e.inflexions, -1);

/** Extremums de f : zéros SIMPLES de f′ ; max si f′ passe de + à −. */
export function extremums(e: E): { maxima: number[]; minima: number[] } {
  const maxima: number[] = [];
  const minima: number[] = [];
  for (const z of e.zeros) {
    if (z.double) continue;
    if (fp(e, z.x - 0.5) > 0) maxima.push(z.x);
    else minima.push(z.x);
  }
  return { maxima, minima };
}

/** Valeur de f′ en un point d'inflexion (extremum de f′), pour la figure du corrigé. */
export const valeurInflexion = (e: E, x: number): number => fp(e, x);
