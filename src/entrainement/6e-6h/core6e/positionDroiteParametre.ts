import type { Conique, Pt } from "../ui6e/outilsConiquesLotH2";
import { polyConique } from "../ui6e/outilsConiquesLotH2";

/**
 * Couche core — `6gen139` « Position d'une droite et d'une conique selon un paramètre » (6e ch. 10, § 4–5,
 * processus 3 TRANSFÉRER). Conique réduite Γ (ellipse, hyperbole, parabole y² = 2px) et famille de droites
 * d_k : y = mx + k (pente m fixée, k réel). Quatre écrans : l'équation en x obtenue en substituant (en
 * fonction de k), les valeurs de k pour lesquelles d_k est tangente (Δ(k) = 0 — aucune si le coefficient de
 * x² est nul : droite parallèle à une asymptote ou à l'axe de la parabole), la position de d_{k₀} (choix
 * fermé : sécante, tangente, extérieure, un seul point sans être tangente) et ses points communs avec Γ.
 * VERDICT (position de d_{k₀}) tiré à parts égales AVANT les nombres ; condition du cours
 * k² = a²m² + b² (ellipse), k² = a²m² − b² (hyperbole), k = p/(2m) (parabole).
 */

export type VariantePD = "ellipse" | "hyperbole" | "parabole";
export type VerdictPD = "secante" | "tangente" | "exterieure" | "unPoint";
export type PhasePD = "equation" | "condition" | "position" | "points";
export const PHASES_PD: PhasePD[] = ["equation", "condition", "position", "points"];
export const VERDICTS: VerdictPD[] = ["secante", "tangente", "exterieure", "unPoint"];

export interface ExercicePD {
  variante: VariantePD;
  conique: Conique;
  /** Pente commune des droites d_k. */
  m: number;
  /** Valeur de k étudiée à l'écran 3. */
  k0: number;
  verdict: VerdictPD;
}

/** Coefficients de l'équation en x : A x² + (B1·k + B0) x + (C2·k² + C0) = 0 (polynôme entier de Γ). */
export interface CoefsPD {
  A: number;
  B1: number;
  B0: number;
  C2: number;
  C0: number;
}

export function coefs(e: ExercicePD): CoefsPD {
  const P = polyConique(e.conique);
  const al = P.x2 ?? 0;
  const be = P.y2 ?? 0;
  const ga = P.x ?? 0;
  const de = P["1"] ?? 0;
  return { A: al + be * e.m * e.m, B1: 2 * be * e.m, B0: ga, C2: be, C0: de };
}

const EPS = 1e-9;
export const degreChute = (e: ExercicePD): boolean => Math.abs(coefs(e).A) < EPS;

/** Valeur F(x ; k) de l'équation en x (comparaison par proportionnalité). */
export function valeurXK(e: ExercicePD, x: number, k: number): number {
  const c = coefs(e);
  return c.A * x * x + (c.B1 * k + c.B0) * x + c.C2 * k * k + c.C0;
}

/** Δ(k) = D2 k² + D1 k + D0. */
export function deltaK(e: ExercicePD): { D2: number; D1: number; D0: number } {
  const c = coefs(e);
  return { D2: c.B1 * c.B1 - 4 * c.A * c.C2, D1: 2 * c.B1 * c.B0, D0: c.B0 * c.B0 - 4 * c.A * c.C0 };
}
export function delta(e: ExercicePD, k: number): number {
  const d = deltaK(e);
  return d.D2 * k * k + d.D1 * k + d.D0;
}

/** Valeurs de k pour lesquelles d_k est tangente ([] si le degré chute). */
export function valeursTangence(e: ExercicePD): number[] {
  if (degreChute(e)) return [];
  const { D2, D1, D0 } = deltaK(e);
  if (Math.abs(D2) < EPS) return Math.abs(D1) < EPS ? [] : [-D0 / D1];
  const disc = D1 * D1 - 4 * D2 * D0;
  if (disc < -EPS) return [];
  if (Math.abs(disc) < EPS) return [-D1 / (2 * D2)];
  const r = Math.sqrt(disc);
  return [(-D1 - r) / (2 * D2), (-D1 + r) / (2 * D2)].sort((u, v) => u - v);
}

/** Abscisses des points communs de d_k et Γ. */
export function abscisses(e: ExercicePD, k: number): number[] {
  const c = coefs(e);
  const B = c.B1 * k + c.B0;
  const C = c.C2 * k * k + c.C0;
  if (Math.abs(c.A) < EPS) return Math.abs(B) < EPS ? [] : [-C / B];
  const d = B * B - 4 * c.A * C;
  if (d < -1e-7) return [];
  if (Math.abs(d) < 1e-7) return [-B / (2 * c.A)];
  const r = Math.sqrt(d);
  return [(-B - r) / (2 * c.A), (-B + r) / (2 * c.A)].sort((u, v) => u - v);
}

export function points(e: ExercicePD, k = e.k0): Pt[] {
  return abscisses(e, k).map((x) => ({ x, y: e.m * x + k }));
}

/** Position de d_k (recalculée depuis les nombres). */
export function positionDe(e: ExercicePD, k: number): VerdictPD {
  if (degreChute(e)) return "unPoint";
  const d = delta(e, k);
  if (Math.abs(d) < 1e-7) return "tangente";
  return d > 0 ? "secante" : "exterieure";
}
