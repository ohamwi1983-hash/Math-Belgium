import type { Q } from "../../5e-4h/ui5e/nombresTrigo";
import { qVal } from "../../5e-4h/ui5e/nombresTrigo";

/**
 * Couche core — `6gen158` « Lire une transformée c + k·arc(mx + n) » (6e ch. 1, § 5, processus 2
 * APPLIQUER ; lot G de l'audit, version « lecture » de 6gen5). La forme est donnée (arcsin, arccos ou
 * arctan, avec m > 0 : les paramètres sont alors uniques) ; l'élève LIT domaine et image sur une grille
 * honnête (lignes verticales entières, lignes horizontales en multiples de π/4, même échelle), puis
 * en déduit m, n, k, c.
 *
 * Décomposition :
 * a. domaine (bornes = points pleins, ou ℝ pour arctan) — lecture ;
 * b. image (points pleins, ou asymptotes ouvertes) — lecture ;
 * c./d. m et n par « mx + n = ±1 aux bornes » (arcsin, arccos) ou « = 0 au centre, = 1 au point
 *    marqué » (arctan, APRÈS k et c) ; k et c par la longueur et la position de l'image (arcsin, arctan :
 *    c au milieu ; arccos : c = valeur à la borne droite, où arccos vaut 0), signe de k par le sens de
 *    variation (m > 0).
 */

export type VarianteLireTransformee = "arcsin" | "arccos" | "arctan";

export interface ExerciceLireTransformee {
  variante: VarianteLireTransformee;
  /** m > 0 (1 ou 1/2). */
  m: Q;
  /** Abscisse du centre (entier) : mx₀ + n = 0. */
  x0: number;
  /** k (rationnel non nul). */
  k: Q;
  /** c en multiples de π : c = cPi·π (cPi multiple de 1/4). */
  cPi: Q;
  cleCollecteur: string;
}

export const mV = (e: ExerciceLireTransformee): number => qVal(e.m);
export const nV = (e: ExerciceLireTransformee): number => -qVal(e.m) * e.x0;
export const kV = (e: ExerciceLireTransformee): number => qVal(e.k);
export const cV = (e: ExerciceLireTransformee): number => qVal(e.cPi) * Math.PI;

export function arcF(e: ExerciceLireTransformee): (u: number) => number {
  return e.variante === "arcsin" ? Math.asin : e.variante === "arccos" ? Math.acos : Math.atan;
}

export function f(e: ExerciceLireTransformee, x: number): number {
  const u = mV(e) * x + nV(e);
  if (e.variante !== "arctan" && Math.abs(u) > 1 + 1e-12) return NaN;
  return cV(e) + kV(e) * arcF(e)(e.variante === "arctan" ? u : Math.max(-1, Math.min(1, u)));
}

/** Bornes du domaine (arcsin, arccos) : x₀ ∓ 1/m. */
export const demiLargeur = (e: ExerciceLireTransformee): number => 1 / mV(e);
