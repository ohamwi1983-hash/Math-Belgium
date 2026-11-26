import { pgcd } from "../../../5e-4h/ui5e/nombresTrigo";

/**
 * `56gen22` — « Rang à partir duquel |uₙ − ℓ| < ε » (5e (6h), « Nombres réels et suites », étape 9
 * `limite-suite`). Couche A : types et générateur (`Math.random()` seul, pour `?code=`).
 *
 * Définition du cours : ℓ est la limite de (uₙ) si, pour tout ε > 0, il existe un rang m tel que
 * n > m ⇒ |uₙ − ℓ| < ε. On cherche le PLUS PETIT tel rang m (le premier rang n qui convient est m + 1 ;
 * l'écart |uₙ − ℓ| est décroissant dans les trois familles, donc il reste sous ε ensuite).
 * - `rationnelle` : uₙ = (an + b)/(cn + d), c > 0, d > 0 ; ℓ = a/c ; |uₙ − ℓ| = K/(c(cn + d)) avec
 *   K = |bc − ad| ; signe de bc − ad (suite au-dessus ou en dessous de ℓ) tiré à parts égales AVANT les
 *   nombres ; inéquation n > B, m = ⌊B⌋ (B ≥ 5, calcul exact en entiers).
 * - `geometrique` : uₙ = ℓ + k/qⁿ (q entier > 1), ℓ + k·rⁿ (0 < r < 1 décimal) ou ℓ + k/(−q)ⁿ ;
 *   |uₙ − ℓ| = |k|/qⁿ ou |k|·rⁿ ; premier rang N par la table de la calculatrice (N ≤ 60, aucun écart
 *   à moins de 4 % de ε) ; m = N − 1.
 * - `fibonacci` : vₙ = Fₙ₊₁/Fₙ → Φ = (1 + √5)/2 ; |vₙ − Φ| = 1/(Fₙ Φⁿ) décroissant ; premier rang N par
 *   la table (aucun écart à moins de 15 % de ε) ; m = N − 1. Écran intermédiaire : v_{n₀} en fraction.
 */

export type VarianteRang = "rationnelle" | "geometrique" | "fibonacci";
export type IdVarianteRang = VarianteRang;
export type FormeGeo = "fraction" | "puissance" | "alterne";

/** ε = μ·10⁻ᵏ (μ ∈ {1, 2, 5}). */
export interface Epsilon {
  mu: number;
  k: number;
}

interface Base {
  eps: Epsilon;
  /** Premier rang n pour lequel |uₙ − ℓ| < ε. */
  N: number;
  /** Plus petit rang m tel que n > m ⇒ |uₙ − ℓ| < ε (m = N − 1). */
  m: number;
  cleCollecteur: string;
}

export interface ExerciceRationnelle extends Base {
  variante: "rationnelle";
  a: number;
  b: number;
  c: number;
  d: number;
  /** K = |bc − ad|. */
  K: number;
  /** bc − ad > 0 : la suite est au-dessus de ℓ. */
  auDessus: boolean;
  /** Borne B = bNum / bDen (fraction réduite, bDen > 0) : n > B. */
  bNum: number;
  bDen: number;
}

export interface ExerciceGeometrique extends Base {
  variante: "geometrique";
  forme: FormeGeo;
  ell: number;
  k: number;
  /** Fraction / alterne : q entier > 1 ; puissance : r décimal (0 < r < 1). */
  q: number;
}

export interface ExerciceFibonacci extends Base {
  variante: "fibonacci";
  /** Rang du terme à écrire en fraction (écran b). */
  n0: number;
}

export type ExerciceRang = ExerciceRationnelle | ExerciceGeometrique | ExerciceFibonacci;

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
function entre(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

export const valeurEps = (e: Epsilon) => e.mu * 10 ** -e.k;
export const PHI = (1 + Math.sqrt(5)) / 2;

/** Nombres de Fibonacci F₀ = 0, F₁ = F₂ = 1… (indice = rang). */
export function fibonacci(n: number): number {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}
export const vFib = (n: number) => fibonacci(n + 1) / fibonacci(n);
export const ecartFib = (n: number) => Math.abs(vFib(n) - PHI);

export function terme(e: ExerciceRang, n: number): number {
  switch (e.variante) {
    case "rationnelle":
      return (e.a * n + e.b) / (e.c * n + e.d);
    case "geometrique":
      return e.ell + ecartSigne(e, n);
    case "fibonacci":
      return vFib(n);
  }
}

/** uₙ − ℓ (géométrique). */
export function ecartSigne(e: ExerciceGeometrique, n: number): number {
  if (e.forme === "fraction") return e.k / e.q ** n;
  if (e.forme === "alterne") return e.k / (-e.q) ** n;
  return e.k * e.q ** n;
}

export function limite(e: ExerciceRang): number {
  return e.variante === "rationnelle" ? e.a / e.c : e.variante === "geometrique" ? e.ell : PHI;
}

/** |uₙ − ℓ|. */
export function ecart(e: ExerciceRang, n: number): number {
  switch (e.variante) {
    case "rationnelle":
      return e.K / (e.c * (e.c * n + e.d));
    case "geometrique":
      return Math.abs(ecartSigne(e, n));
    case "fibonacci":
      return ecartFib(n);
  }
}

const EPS_RATIONNELLE: Epsilon[] = [
  { mu: 1, k: 2 },
  { mu: 5, k: 3 },
  { mu: 2, k: 3 },
  { mu: 1, k: 3 },
  { mu: 5, k: 4 },
  { mu: 1, k: 4 },
];
const EPS_TABLE: Epsilon[] = [
  { mu: 5, k: 2 },
  { mu: 2, k: 2 },
  { mu: 1, k: 2 },
  { mu: 5, k: 3 },
  { mu: 2, k: 3 },
  { mu: 1, k: 3 },
  { mu: 5, k: 4 },
  { mu: 1, k: 4 },
  { mu: 1, k: 5 },
  { mu: 1, k: 6 },
];

function construireRationnelle(): ExerciceRationnelle {
  const auDessus = Math.random() < 0.5; // tiré AVANT les nombres
  for (;;) {
    const c = entre(1, 4);
    const a = parmi([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7]);
    const d = entre(1, 6);
    const b = entre(-9, 12);
    const diff = b * c - a * d;
    if (diff === 0 || diff > 0 !== auDessus) continue;
    if (pgcd(pgcd(Math.abs(a), Math.abs(b)), pgcd(c, d)) !== 1) continue; // numérateur et dénominateur sans facteur commun évident
    const K = Math.abs(diff);
    if (K > 20) continue;
    const eps = parmi(EPS_RATIONNELLE);
    // B = (K/(cε) − d)/c = (K·10ᵏ − c·d·μ)/(c²·μ)
    const num = K * 10 ** eps.k - c * d * eps.mu;
    const den = c * c * eps.mu;
    if (num <= 0) continue;
    const g = pgcd(num, den);
    const bNum = num / g;
    const bDen = den / g;
    const m = Math.floor(bNum / bDen);
    if (m < 5 || m > 200000) continue;
    return { variante: "rationnelle", a, b, c, d, K, auDessus, bNum, bDen, eps, N: m + 1, m, cleCollecteur: `rationnelle/${auDessus ? "dessus" : "dessous"}/${eps.mu}e-${eps.k}/${bDen === 1 ? "entier" : "frac"}` };
  }
}

/** Premier rang N ≤ nMax tel que ecart(N) < ε, avec une marge relative ; `null` si introuvable ou trop près de ε. */
function premierRang(ecartDe: (n: number) => number, eps: number, marge: number, nMax: number): number | null {
  for (let n = 1; n <= nMax; n++) {
    const x = ecartDe(n);
    if (Math.abs(x / eps - 1) < marge) return null;
    if (x < eps) return n;
  }
  return null;
}

function construireGeometrique(): ExerciceGeometrique {
  for (;;) {
    const forme = parmi(["fraction", "puissance", "alterne"] as const);
    const q = forme === "puissance" ? parmi([0.5, 0.6, 0.75, 0.8, 0.9]) : forme === "fraction" ? parmi([2, 3, 4, 5, 10]) : parmi([2, 3, 4]);
    const k = parmi([-9, -7, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 9]);
    const ell = entre(-3, 6);
    const eps = parmi(EPS_TABLE);
    const base: ExerciceGeometrique = { variante: "geometrique", forme, ell, k, q, eps, N: 0, m: 0, cleCollecteur: "" };
    const N = premierRang((n) => ecart(base, n), valeurEps(eps), 0.04, 60);
    if (N === null || N < 4) continue;
    return { ...base, N, m: N - 1, cleCollecteur: `geometrique/${forme}/N${N <= 10 ? N : N <= 20 ? "11-20" : "21+"}` };
  }
}

function construireFibonacci(): ExerciceFibonacci {
  for (;;) {
    const eps = parmi(EPS_TABLE);
    const N = premierRang(ecartFib, valeurEps(eps), 0.15, 40);
    if (N === null || N < 4) continue;
    const n0 = entre(5, 9);
    return { variante: "fibonacci", eps, N, m: N - 1, n0, cleCollecteur: `fibonacci/N${N}` };
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteRang; label: string }[] = [
  { id: "rationnelle", label: "Suite (an + b)/(cn + d) : inéquation" },
  { id: "geometrique", label: "Suite ℓ + k/qⁿ ou ℓ + k·rⁿ : table de la calculatrice" },
  { id: "fibonacci", label: "Rapports de Fibonacci et nombre d'or" },
];

export function construireAvecVarianteId(id: IdVarianteRang): ExerciceRang {
  return id === "rationnelle" ? construireRationnelle() : id === "geometrique" ? construireGeometrique() : construireFibonacci();
}

export function genererExerciceRang(): ExerciceRang {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
