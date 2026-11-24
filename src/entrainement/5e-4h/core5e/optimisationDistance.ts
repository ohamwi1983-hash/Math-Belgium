import type { Exacte } from "../ui5e/ecrituresLimitesLotG";
import { coefX, exacte, exacteL, exacteV, extraire, plusL } from "../ui5e/ecrituresLimitesLotG";
import type { Q } from "../ui5e/nombresTrigo";
import { nbL, q, qL, qVal } from "../ui5e/nombresTrigo";

/**
 * Couche core — `5gen71` « Optimisation : distance et temps minimaux » (5e ch. 5, § 8, processus 3
 * TRANSFÉRER). Quatre situations où l'élève CONSTRUIT la fonction à minimiser (méthode du § 8 :
 * une seule variable, dérivée, zéro, signe sur le domaine réaliste, comparaison aux bornes) :
 * - pointRacine : point M(x ; √(kx)) de la courbe y = √(kx) le plus proche de A(a ; 0) — on
 *   minimise D(x) = AM² ; VERDICT tiré (≈ 25 %) : x₀ = a − k/2 HORS du domaine [0 ; +∞[, le
 *   minimum est alors à la borne x = 0 (M = O) ;
 * - pointHyperbole : point M(x ; k/x), x > 0, le plus proche de O — D(x) = x² + k²/x², x₀ = √k
 *   (on rejette −√k) ;
 * - sauveteur : course sur le rivage (v₁) puis nage (v₂) — T(x) = x/v₁ + √((L − x)² + h²)/v₂ sur
 *   [0 ; L], vitesses telles que √(v₁² − v₂²) est décimal (x₀ = L − h·v₂/√(v₁² − v₂²) entier,
 *   MN entier) ; VERDICT tiré (≈ 25 %) : x₀ < 0, il faut nager tout de suite (borne x = 0) ; le
 *   temps est arrondi au dixième (calculatrice) ;
 * - cable : câble A → M (sur la rive) → B — ℓ(x) = √(x² + a²) + √((L − x)² + b²), x₀ = aL/(a + b)
 *   entier, longueur minimale √(L² + (a + b)²) entière (triplets pythagoriciens).
 * Cinq écrans : modèle (expression), dérivée (expression), zéro x₀, signe de la dérivée sur le
 * domaine (choix fermé), optimum (x et valeur minimale).
 */

export type VarianteOptimisationDistance = "pointRacine" | "pointHyperbole" | "sauveteur" | "cable";

export interface ExerciceOptimisationDistance {
  variante: VarianteOptimisationDistance;
  d: Record<string, number>;
}

/** Vitesses du sauveteur (m/s) : v₁² − v₂² = w² ; MH = h·v₂/w = h·num/den. */
export const VITESSES = [
  { v1: 5.2, v2: 2, w: 4.8, num: 5, den: 12 },
  { v1: 6.5, v2: 2.5, w: 6, num: 5, den: 12 },
  { v1: 5, v2: 1.4, w: 4.8, num: 7, den: 24 },
  { v1: 7.5, v2: 2.1, w: 7.2, num: 7, den: 24 },
  { v1: 4.25, v2: 2, w: 3.75, num: 8, den: 15 },
] as const;

/** Triplets (p, q, r) : L = p·c, a + b = q·c, longueur minimale r·c. */
export const TRIPLETS = [
  { p: 3, q: 4, r: 5, cMin: 8, cMax: 16 },
  { p: 4, q: 3, r: 5, cMin: 8, cMax: 18 },
  { p: 12, q: 5, r: 13, cMin: 3, cMax: 7 },
  { p: 15, q: 8, r: 17, cMin: 2, cMax: 5 },
] as const;

export type MotifSigne = "neg-pos" | "pos" | "neg" | "pos-neg";

export interface ModeleOptimisation {
  /** Nom de la fonction en LaTeX (« D », « T », « \ell ») et en texte (« D », « T », « ℓ »). */
  nomL: string;
  nomT: string;
  /** Membre de droite du modèle et de sa dérivée (LaTeX). */
  fL: string;
  fpL: string;
  f: (x: number) => number;
  fp: (x: number) => number;
  /** Points de contrôle des expressions (dans le domaine). */
  pts: number[];
  domaineL: string;
  borneG: number;
  borneD: number;
  x0: number;
  x0L: string;
  dehors: boolean;
  xOpt: number;
  xOptL: string;
  /** Valeur minimale demandée (distance, temps, longueur) : exacte ou arrondie au dixième. */
  valOpt: number;
  valOptL: string;
  valExacte: boolean;
  motif: MotifSigne;
  /** Étiquettes KaTeX et unités des champs de l'écran 5. */
  labelX: string;
  labelVal: string;
  uniteX?: string;
  uniteVal?: string;
}

const dec = (x: number) => nbL(x, 4);

function pointRacine(d: Record<string, number>): ModeleOptimisation {
  const { k, a } = d;
  const x0q: Q = q(2 * a - k, 2);
  const x0 = qVal(x0q);
  const dehors = x0 < 0;
  const yL = k === 1 ? "\\sqrt{x}" : `\\sqrt{${k}x}`;
  void yL;
  let valOpt: number;
  let valOptL: string;
  if (dehors) {
    valOpt = Math.abs(a);
    valOptL = `${Math.abs(a)}`;
  } else {
    const { c, r } = extraire(k * (4 * a - k));
    const ex: Exacte = exacte(c, 2, r);
    valOpt = exacteV(ex);
    valOptL = exacteL(ex);
  }
  return {
    nomL: "D",
    nomT: "D",
    fL: `(x${plusL(-a)})^2+${coefX(k)}`,
    fpL: `2x${plusL(k - 2 * a)}`,
    f: (x) => (x - a) ** 2 + k * x,
    fp: (x) => 2 * x + k - 2 * a,
    pts: [0.3, 1.7, 2.9, 4.4, 6.1],
    domaineL: "\\left[0\\,;+\\infty\\right[",
    borneG: 0,
    borneD: Infinity,
    x0,
    x0L: qL(x0q),
    dehors,
    xOpt: dehors ? 0 : x0,
    xOptL: dehors ? "0" : qL(x0q),
    valOpt,
    valOptL,
    valExacte: true,
    motif: dehors ? "pos" : "neg-pos",
    labelX: "x_M=",
    labelVal: "AM_{\\min}=",
  };
}

function pointHyperbole(d: Record<string, number>): ModeleOptimisation {
  const { k } = d;
  const { c, r } = extraire(k);
  const x0e = exacte(c, 1, r);
  const v = extraire(2 * k);
  const ve = exacte(v.c, 1, v.r);
  return {
    nomL: "D",
    nomT: "D",
    fL: `x^2+\\dfrac{${k * k}}{x^2}`,
    fpL: `2x-\\dfrac{${2 * k * k}}{x^3}`,
    f: (x) => x * x + (k * k) / (x * x),
    fp: (x) => 2 * x - (2 * k * k) / x ** 3,
    pts: [0.4, 0.9, 1.7, 2.6, 3.8],
    domaineL: "\\left]0\\,;+\\infty\\right[",
    borneG: 0,
    borneD: Infinity,
    x0: exacteV(x0e),
    x0L: exacteL(x0e),
    dehors: false,
    xOpt: exacteV(x0e),
    xOptL: exacteL(x0e),
    valOpt: exacteV(ve),
    valOptL: exacteL(ve),
    valExacte: true,
    motif: "neg-pos",
    labelX: "x_M=",
    labelVal: "OM_{\\min}=",
  };
}

/** T(x) du sauveteur. */
export function tempsSauveteur(d: Record<string, number>, x: number): number {
  const V = VITESSES[d.s]!;
  return x / V.v1 + Math.sqrt((d.L - x) ** 2 + d.h ** 2) / V.v2;
}

function sauveteur(d: Record<string, number>): ModeleOptimisation {
  const V = VITESSES[d.s]!;
  const { L, h } = d;
  const u = (h * V.num) / V.den;
  const x0 = L - u;
  const dehors = x0 < 0;
  const xOpt = dehors ? 0 : x0;
  const T = tempsSauveteur(d, xOpt);
  const Tr = Math.round(T * 10) / 10;
  return {
    nomL: "T",
    nomT: "T",
    fL: `\\dfrac{x}{${dec(V.v1)}}+\\dfrac{\\sqrt{(${L}-x)^2+${h}^2}}{${dec(V.v2)}}`,
    fpL: `\\dfrac{1}{${dec(V.v1)}}-\\dfrac{${L}-x}{${dec(V.v2)}\\sqrt{(${L}-x)^2+${h}^2}}`,
    f: (x) => tempsSauveteur(d, x),
    fp: (x) => 1 / V.v1 - (L - x) / (V.v2 * Math.sqrt((L - x) ** 2 + h * h)),
    pts: [0, 3.7, L / 3, L / 2, 0.8 * L],
    domaineL: `[0\\,;${L}]`,
    borneG: 0,
    borneD: L,
    x0,
    x0L: `${x0}`,
    dehors,
    xOpt,
    xOptL: `${xOpt}`,
    valOpt: Tr,
    valOptL: nbL(Tr, 1, true),
    valExacte: false,
    motif: dehors ? "pos" : "neg-pos",
    labelX: "x=",
    labelVal: "T_{\\min}\\approx",
    uniteX: "m",
    uniteVal: "s",
  };
}

function cable(d: Record<string, number>): ModeleOptimisation {
  const { L, a, b } = d;
  const s = a + b;
  const x0 = (a * L) / s;
  const R = Math.sqrt(L * L + s * s);
  return {
    nomL: "\\ell",
    nomT: "ℓ",
    fL: `\\sqrt{x^2+${a}^2}+\\sqrt{(${L}-x)^2+${b}^2}`,
    fpL: `\\dfrac{x}{\\sqrt{x^2+${a}^2}}-\\dfrac{${L}-x}{\\sqrt{(${L}-x)^2+${b}^2}}`,
    f: (x) => Math.sqrt(x * x + a * a) + Math.sqrt((L - x) ** 2 + b * b),
    fp: (x) => x / Math.sqrt(x * x + a * a) - (L - x) / Math.sqrt((L - x) ** 2 + b * b),
    pts: [0, 3.7, L / 3, L / 2, 0.8 * L],
    domaineL: `[0\\,;${L}]`,
    borneG: 0,
    borneD: L,
    x0,
    x0L: `${x0}`,
    dehors: false,
    xOpt: x0,
    xOptL: `${x0}`,
    valOpt: R,
    valOptL: `${Math.round(R)}`,
    valExacte: true,
    motif: "neg-pos",
    labelX: "x=",
    labelVal: "\\ell_{\\min}=",
    uniteX: "m",
    uniteVal: "m",
  };
}

const CACHE = new WeakMap<ExerciceOptimisationDistance, ModeleOptimisation>();
export function modele(e: ExerciceOptimisationDistance): ModeleOptimisation {
  const c = CACHE.get(e);
  if (c) return c;
  const m = e.variante === "pointRacine" ? pointRacine(e.d) : e.variante === "pointHyperbole" ? pointHyperbole(e.d) : e.variante === "sauveteur" ? sauveteur(e.d) : cable(e.d);
  CACHE.set(e, m);
  return m;
}

/** « √x », « √(2x) » : ordonnée de M sur la courbe y = √(kx) (LaTeX). */
export const racineKxL = (k: number) => (k === 1 ? "\\sqrt{x}" : `\\sqrt{${k}x}`);
