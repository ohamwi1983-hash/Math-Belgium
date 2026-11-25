/**
 * Modèle commun des générateurs 5gen76, 5gen77, 5gen36, 5gen37, 5gen38 (5e ch. 6, « Statistique à deux
 * variables », lot H1) : statistiques d'une série double (moyennes, variance et écart-type DIVISÉS PAR n
 * comme en 4e, covariance, droite des moindres carrés, coefficient de corrélation), droite de Mayer
 * (données triées par x croissants, premier groupe des ⌊n/2⌋ premiers points — n impair : groupes k et
 * k + 1), tableau d'interprétation de r (seuils du document du professeur, « très forte » entre 0,98 et 1,
 * « parfaite » réservé à |r| = 1) et nuages au coefficient de corrélation IMPOSÉ. Hasard : `Math.random`
 * seul (le `?code=` le remplace par une graine).
 */

export interface Pt {
  x: number;
  y: number;
}

// ============================================================================
// Hasard.
// ============================================================================

export const entier = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a + 1));
export function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
export function melanger<T>(t: readonly T[]): T[] {
  const c = [...t];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
}
/** Loi normale centrée réduite (Box-Muller). */
export function normale(): number {
  const u = Math.random() || 1e-12;
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ============================================================================
// Nombres.
// ============================================================================

/** Nombre nettoyé du bruit flottant (12 chiffres significatifs). */
export const net = (v: number): number => (v === 0 || Object.is(v, -0) ? 0 : Number(v.toPrecision(12)));

/** Arrondi symétrique à `d` décimales (−2,345 → −2,35 à 10⁻²). */
export function arrondi(v: number, d: number): number {
  const f = 10 ** d;
  const r = (Math.sign(v) * Math.round(Math.abs(net(v)) * f + 1e-9)) / f;
  return net(r);
}

/** Nombre de décimales d'un décimal (au plus 12). */
export function decimales(v: number): number {
  const s = net(v).toString();
  if (s.includes("e")) return 12;
  const p = s.indexOf(".");
  return p < 0 ? 0 : s.length - p - 1;
}

export const egal = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

// ============================================================================
// Statistiques (division par n).
// ============================================================================

export const somme = (v: readonly number[]): number => v.reduce((s, x) => s + x, 0);
export const moyenne = (v: readonly number[]): number => somme(v) / v.length;
export const xs = (p: readonly Pt[]): number[] => p.map((q) => q.x);
export const ys = (p: readonly Pt[]): number[] => p.map((q) => q.y);

export function pointMoyen(p: readonly Pt[]): Pt {
  return { x: net(moyenne(xs(p))), y: net(moyenne(ys(p))) };
}

/** V(x) = (1/n)·Σ(xᵢ − x̄)². */
export function variance(v: readonly number[]): number {
  const m = moyenne(v);
  return somme(v.map((x) => (x - m) ** 2)) / v.length;
}
export const sigma = (v: readonly number[]): number => Math.sqrt(variance(v));
/** Écart-type « d'échantillon » Sx (division par n − 1) : la TI-30XB l'affiche aussi — piège. */
export const sEchantillon = (v: readonly number[]): number => Math.sqrt((variance(v) * v.length) / (v.length - 1));

/** Σ XᵢYᵢ et Σ Xᵢ², Σ Yᵢ² (écarts à la moyenne). */
export function sommesEcarts(p: readonly Pt[]): { sXY: number; sX2: number; sY2: number } {
  const g = pointMoyen(p);
  return {
    sXY: net(somme(p.map((q) => (q.x - g.x) * (q.y - g.y)))),
    sX2: net(somme(p.map((q) => (q.x - g.x) ** 2))),
    sY2: net(somme(p.map((q) => (q.y - g.y) ** 2))),
  };
}

export const covariance = (p: readonly Pt[]): number => sommesEcarts(p).sXY / p.length;
/** (1/n)·Σ xᵢyᵢ (seconde formule de la covariance). */
export const moyenneProduits = (p: readonly Pt[]): number => somme(p.map((q) => q.x * q.y)) / p.length;

/** Droite des moindres carrés (de y en x) : a = ΣXᵢYᵢ / ΣXᵢ², b = ȳ − a·x̄. */
export function moindresCarres(p: readonly Pt[]): { a: number; b: number } {
  const g = pointMoyen(p);
  const { sXY, sX2 } = sommesEcarts(p);
  const a = sXY / sX2;
  return { a, b: g.y - a * g.x };
}

export function correlation(p: readonly Pt[]): number {
  const { sXY, sX2, sY2 } = sommesEcarts(p);
  return sXY / Math.sqrt(sX2 * sY2);
}

// ============================================================================
// Droite de Mayer.
// ============================================================================

export interface Mayer {
  tries: Pt[];
  /** Effectif du premier groupe (⌊n/2⌋) ; le second a n − k points. */
  k: number;
  G1: Pt;
  G2: Pt;
  a: number;
  b: number;
}

/** Tri par x croissants (ordre stable), premier groupe des ⌊n/2⌋ premiers points. */
export function mayer(p: readonly Pt[]): Mayer {
  const tries = [...p].map((q, i) => ({ q, i })).sort((u, v) => u.q.x - v.q.x || u.i - v.i).map((u) => u.q);
  const k = Math.floor(p.length / 2);
  const G1 = pointMoyen(tries.slice(0, k));
  const G2 = pointMoyen(tries.slice(k));
  const a = (G2.y - G1.y) / (G2.x - G1.x);
  return { tries, k, G1, G2, a, b: G1.y - a * G1.x };
}

// ============================================================================
// Interprétation de r (tableau du cours).
// ============================================================================

export type ClasseR = "parfaite" | "tresForte" | "forte" | "moyenne" | "faible" | "nulle";

/** Seuils du document du professeur (|r|) : nulle < 0,35 ≤ faible < 0,60 ≤ moyenne < 0,80 ≤ forte < 0,98 ≤
 * très forte < 1 ; parfaite = |r| = 1 (points alignés). */
export const SEUILS_R = [0.35, 0.6, 0.8, 0.98] as const;

export function classeR(r: number): ClasseR {
  const a = Math.abs(r);
  if (a > 1 - 1e-12) return "parfaite";
  if (a >= 0.98) return "tresForte";
  if (a >= 0.8) return "forte";
  if (a >= 0.6) return "moyenne";
  if (a >= 0.35) return "faible";
  return "nulle";
}

/** Distance de |r| au seuil le plus proche (on évite les valeurs ambiguës, à la limite de deux classes). */
export const distanceSeuil = (r: number): number => Math.min(...SEUILS_R.map((s) => Math.abs(Math.abs(r) - s)));

export const NOM_CLASSE: Record<ClasseR, string> = {
  parfaite: "parfaite",
  tresForte: "très forte",
  forte: "forte",
  moyenne: "moyenne",
  faible: "faible",
  nulle: "nulle",
};

// ============================================================================
// Nuage au coefficient de corrélation imposé.
// ============================================================================

/** Valeurs centrées réduites (division par n). */
function centreesReduites(v: number[]): number[] {
  const m = moyenne(v);
  const s = sigma(v);
  return v.map((x) => (x - m) / s);
}

/**
 * Ordonnées z (centrées réduites) telles que corr(x, z) = r EXACTEMENT : z = r·zx + √(1 − r²)·ze, où ze est
 * un bruit gaussien rendu orthogonal à zx puis réduit.
 */
export function ordonneesCorrelees(abscisses: number[], r: number): number[] {
  const zx = centreesReduites(abscisses);
  const n = abscisses.length;
  for (let essai = 0; essai < 50; essai++) {
    let e = Array.from({ length: n }, normale);
    const me = moyenne(e);
    e = e.map((v) => v - me);
    const proj = somme(e.map((v, i) => v * zx[i]!)) / n;
    e = e.map((v, i) => v - proj * zx[i]!);
    const s = Math.sqrt(somme(e.map((v) => v * v)) / n);
    if (s < 1e-6) continue;
    const ze = e.map((v) => v / s);
    return zx.map((v, i) => r * v + Math.sqrt(Math.max(0, 1 - r * r)) * ze[i]!);
  }
  return zx.map((v) => r * v);
}
